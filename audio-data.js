document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('[Product-Card="Card"]');
    const basePath = 'https://dl.dropboxusercontent.com/scl/fi/';
    const audioElement = document.getElementById('audio');
    const audioSource = audioElement.querySelector('source');

    // Initialize an empty array to store the data
    let audioData = [];

    // Variable to store the index of the currently playing audio
    let currentPlayingIndex = null;

    // Reference popup playbar elements
    const popupPlayButton = document.getElementById('popup-play-button');
    const popupPlayingButton = document.getElementById('popup-playing-button');
    const popupProgressBar = document.getElementById('popup-progress-bar');

    // Initialize Lottie animations for popup playbar
    let popupPlayAnimation = lottie.loadAnimation({
        container: popupPlayButton,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'https://cdn.prod.website-files.com/63d57f679309cee3851d5bd0/6660db983499aff763170beb_Play_to_Playing.json'
    });

    let popupPauseAnimation = lottie.loadAnimation({
        container: popupPlayingButton,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: 'https://cdn.prod.website-files.com/63d57f679309cee3851d5bd0/6660db9885695d761361c9ad_Playing_Loop.json'
    });

    // Iterate through each product card
    productCards.forEach((card, index) => {
        const audioUrl = card.querySelector('[audio-data="url"]');
        const mainImage = card.querySelector('[cms-image="main-image"]');
        const playButton = card.querySelector('.play-button');
        const playingButton = card.querySelector('.playing-button');
        const progressBar = card.querySelector('.progress-bar');
        const genre = card.querySelector('[fs-cmsfilter-field="GENRE"]');
        const subgenre = card.querySelector('[fs-cmsfilter-field="SUBGENRE"]');
        const title = card.querySelector('[product-title="title"]');
        const category = card.querySelector('[fs-cmsfilter-field="SOUNDSUBCATEGORY"]');

        let playAnimation = lottie.loadAnimation({
            container: playButton,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'https://cdn.prod.website-files.com/63d57f679309cee3851d5bd0/6660db983499aff763170beb_Play_to_Playing.json'
        });

        let pauseAnimation = lottie.loadAnimation({
            container: playingButton,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            path: 'https://cdn.prod.website-files.com/63d57f679309cee3851d5bd0/6660db9885695d761361c9ad_Playing_Loop.json'
        });

        if (audioUrl && mainImage) {
            audioData.push({
                url: audioUrl.innerHTML,
                image: mainImage.src,
                title: title.innerHTML,
                genre: genre.innerHTML,
                subgenre: subgenre.innerHTML,
                category: category.innerHTML,
                playButton: playButton,
                playingButton: playingButton,
                progressBar: progressBar,
                playAnimation: playAnimation,
                pauseAnimation: pauseAnimation
            });

            playButton.addEventListener('click', () => changeAudioData(index));
            playingButton.addEventListener('click', () => pauseAudio(index));
        }
    });

    // Click listener for popup play button
    popupPlayButton.addEventListener('click', () => {
        if (currentPlayingIndex !== null) {
            changeAudioData(currentPlayingIndex);
        }
    });

    // Click listener for popup playing button
    popupPlayingButton.addEventListener('click', () => {
        if (currentPlayingIndex !== null) {
            pauseAudio(currentPlayingIndex);
        }
    });

    // Function to play audio
    async function changeAudioData(index) {
        if (currentPlayingIndex !== null && currentPlayingIndex !== index) {
            pauseAudio(currentPlayingIndex);
        }

        currentPlayingIndex = index;
        let currentAudio = audioData[index];
        let newSrc = basePath + currentAudio.url;
        audioSource.src = newSrc;
        audioElement.load();

        // Update popup player details
        const popupPlayer = document.getElementById('popup-player');
        const popupPlayerImage = document.getElementById('popup-player-image');
        const popupPlayerTitle = document.getElementById('popup-player-title');
        const popupPlayerCategory = document.getElementById('popup-player-category');
        const popupPlayerGenre = document.getElementById('popup-player-genre');
        const popupPlayerSubgenre = document.getElementById('popup-player-subgenre');

        popupPlayerImage.src = currentAudio.image;
        popupPlayerTitle.textContent = currentAudio.title;
        popupPlayerCategory.textContent = currentAudio.category;
        popupPlayerGenre.textContent = currentAudio.genre;
        popupPlayerSubgenre.textContent = currentAudio.subgenre;

        if (popupPlayer.style.display === '') {
            popupPlayer.style.display = 'block';
        }

        audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
        audioElement.addEventListener('canplaythrough', handleCanPlayThrough, { once: true });

        // Function to play audio
        async function playAudio(index) {
            try {
                let currentAudio = audioData[index];

                // Check if audio was paused and resume from current time
                if (!audioElement.paused && audioElement.currentTime > 0) {
                    audioElement.currentTime = audioElement.currentTime;
                } else {
                    let newSrc = basePath + currentAudio.url;
                    audioSource.src = newSrc;
                    audioElement.load();
                    await audioElement.play();
                }

                currentAudio.playAnimation.play();
                currentAudio.playAnimation.addEventListener('complete', () => {
                    currentAudio.playButton.style.display = 'none';
                    currentAudio.playingButton.style.display = 'block';
                    currentAudio.pauseAnimation.play();

                    // Sync popup playbar animations
                    popupPlayButton.style.display = 'none';
                    popupPlayingButton.style.display = 'block';
                    popupPauseAnimation.play();
                }, { once: true });

                // Update progress bar during audio playback
                audioElement.addEventListener('timeupdate', () => {
                    updateProgressBar(index);
                });

            } catch (error) {
                console.error('Error playing audio:', error);
            }
        }

        function handleCanPlayThrough() {
            playAudio();
            audioElement.addEventListener('timeupdate', updateProgressBar);
        }

        playAudio();
    }

    // Function to pause audio
    function pauseAudio(index) {
        let currentAudio = audioData[index];
        audioElement.pause();
        currentAudio.pauseAnimation.loop = false;
        currentAudio.pauseAnimation.addEventListener('complete', () => {
            currentAudio.pauseAnimation.stop();
            currentAudio.playingButton.style.display = 'none';
            currentAudio.playButton.style.display = 'block';
            currentAudio.playAnimation.setDirection(-1);
            currentAudio.playAnimation.play();

            // Sync popup playbar animations
            popupPlayingButton.style.display = 'none';
            popupPlayButton.style.display = 'block';
            popupPlayAnimation.setDirection(-1);
            popupPlayAnimation.play();
        }, { once: true });
    }

    // Function to update progress bar
    function updateProgressBar(index) {
        let currentAudio = audioData[index];
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration;
        const progressPercent = (currentTime / duration) * 100;
        currentAudio.progressBar.style.width = progressPercent + '%';
        popupProgressBar.style.width = progressPercent + '%'; // Update popup progress bar

        if (progressPercent === 100) {
            currentAudio.pauseAnimation.loop = false;
            currentAudio.pauseAnimation.addEventListener('complete', () => {
                currentAudio.pauseAnimation.stop();
                currentAudio.playingButton.style.display = 'none';
                currentAudio.playButton.style.display = 'block';
                currentAudio.playAnimation.setDirection(-1);
                currentAudio.playAnimation.play();

                // Sync popup playbar animations
                popupPlayingButton.style.display = 'none';
                popupPlayButton.style.display = 'block';
                popupPlayAnimation.setDirection(-1);
                popupPlayAnimation.play();
            }, { once: true });
        }
    }

