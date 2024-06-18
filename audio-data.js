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

            playButton.addEventListener('click', () => {
                if (currentPlayingIndex !== null) {
                    // Pause any currently playing audio if different index is clicked
                    if (currentPlayingIndex !== index) {
                        pauseAudio(currentPlayingIndex);
                    }
                }
                // Update the currentPlayingIndex
                currentPlayingIndex = index;
                // Call changeAudioData to load and play the audio
                changeAudioData(index);
            });

            playingButton.addEventListener('click', () => pauseAudio(index));
        }
    });

    // Function to play audio
    async function playAudio(index, startTime = 0) {
        const currentAudio = audioData[index];
        try {
            audioElement.currentTime = startTime; // Set current time to resume from the provided time
            console.log(audioElement.currentTime);
            await audioElement.play();
            currentAudio.playAnimation.play();
            popupPlayAnimation.play(); // Start popup play animation
            currentAudio.playAnimation.addEventListener('complete', () => {
                currentAudio.playButton.style.display = 'none';
                currentAudio.playingButton.style.display = 'block';
                currentAudio.pauseAnimation.play();
                popupPlayButton.style.display = 'none';
                popupPlayingButton.style.display = 'block';
                popupPauseAnimation.play(); // Start popup pause animation
            }, { once: true });
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }

    function pauseAudio(index) {
        let currentAudio = audioData[index];
        audioElement.pause();
        currentAudio.pauseAnimation.loop = false;
        currentAudio.pauseAnimation.addEventListener('complete', () => {
            currentAudio.pauseAnimation.stop();
            currentAudio.playingButton.style.display = 'none';
            currentAudio.playButton.style.display = 'block';
            currentAudio.playAnimation.goToAndStop(0); // Reset product card play animation to start
            popupPlayingButton.style.display = 'none';
            popupPlayButton.style.display = 'block';
            popupPlayAnimation.goToAndStop(0); // Reset popup play animation to start
        }, { once: true });
    }

    function updateProgressBar() {
        const popupPlayerDuration = document.getElementById('popup-player-duration');
        const popupPlayerCurrentTime = document.getElementById('popup-player-current-time');
        if (currentPlayingIndex === null) return;
        const currentAudio = audioData[currentPlayingIndex];
        const currentTime = audioElement.currentTime.toFixed(2);
        const duration = audioElement.duration.toFixed(2);
        popupPlayerDuration.textContent = duration;
        popupPlayerCurrentTime.textContent = currentTime;
        const progressPercent = (currentTime / duration) * 100;
        currentAudio.progressBar.style.width = progressPercent + '%';
        popupProgressBar.style.width = progressPercent + '%';  // Update popup progress bar

        if (progressPercent === 100) {
            currentAudio.pauseAnimation.loop = false;
            currentAudio.pauseAnimation.addEventListener('complete', () => {
                currentAudio.pauseAnimation.stop();
                currentAudio.playingButton.style.display = 'none';
                currentAudio.playButton.style.display = 'block';
                currentAudio.playAnimation.goToAndStop(0); // Reset product card play animation to start
                popupPlayingButton.style.display = 'none';
                popupPlayButton.style.display = 'block';
                popupPlayAnimation.goToAndStop(0); // Reset popup play animation to start
            }, { once: true });
        } else {
            if (audioElement.paused) {
                audioData[currentPlayingIndex].playButton.addEventListener('click', () => playAudio(currentPlayingIndex, currentTime));
            }
        }
    }

    // Function to change audio data
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

        function handleCanPlayThrough() {
            playAudio(index, audioElement.currentTime); // Resume from the current time
            audioElement.addEventListener('timeupdate', updateProgressBar);
        }
    }
});
