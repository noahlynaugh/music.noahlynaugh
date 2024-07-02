document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('[Product-Card="Card"]');
    const basePath = 'https://dl.dropboxusercontent.com/scl/fi/';
    const audioElement = document.getElementById('audio');
    const audioSource = audioElement.querySelector('source');

    // Retrieve the stored value from localStorage
    let storedValue = localStorage.getItem('popupPlayerVisible');

    // Make a state varible that keeps track of play/paused state
    let playPause = localStorage.getItem('playPauseState');

    // Initialize an empty array to store the data
    let audioData = [];

    // Variable to store the index of the currently playing audio
    let currentPlayingIndex = null;


    if (playPause === 'play'){
        console.log("pretty boy");
        let storedIndex = localStorage.getItem('currentPlayingIndex');
        changeAudioPlayer(storedIndex);
    }
    else{
        console.log("ugly boy");
    }

    if (storedValue === 'flex') {
        console.log('Keep popupPlayer Data');
        let storedIndex = localStorage.getItem('currentPlayingIndex') || null;
        changeAudioPlayer(storedIndex);
    } 
    else {
        console.log('Nothing playing');
    }

    // Reference popup playbar elements
    const popupPlayButton = document.getElementById('popup-play-button');
    const popupPlayingButton = document.getElementById('popup-playing-button');

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
                    if (currentPlayingIndex !== null && currentPlayingIndex !== index) {
                        pauseAudio(currentPlayingIndex);
                    }
                }
                // Update the currentPlayingIndex
                currentPlayingIndex = index;
                // Call changeAudioData to load and play the audio
                changeAudioData(index);
            });

            popupPlayButton.addEventListener('click',() =>{
                currentPlayingIndex = localStorage.getItem('currentPlayingIndex');
                    if (currentPlayingIndex !== null && currentPlayingIndex !== index) {
                        let currentTime = localStorage.getItem('currentPlayingTime');
                        playStoredAudio(currentTime);
                    }
                });

            playingButton.addEventListener('click', () => pauseAudio(index));

            popupPlayingButton.addEventListener('click', () =>{
                currentPlayingIndex = localStorage.getItem('currentPlayingIndex');
                if (currentPlayingIndex !== null && currentPlayingIndex !== index) {
                    pauseStoredAudio();
                }
            });
        };
    });

    // Function to add a played song to localStorage
    function addPlayedSong(audioData) {
        // Retrieve existing played songs from localStorage or initialize an empty array
        let playedSongs = JSON.parse(localStorage.getItem('playedSongs')) || [];

        // Check if an entry with the same url already exists
        const existingIndex = playedSongs.findIndex(item => item.url === audioData.url);

        if (existingIndex !== -1) {
            // If found, replace the existing entry
            localStorage.setItem('currentPlayingIndex', existingIndex);
        } else {
            // Extract only the necessary data to store
        let playedSongsIndex = (playedSongs.length);
        let dataToStore = {
            url: audioData.url,
            image: audioData.image,
            title: audioData.title,
            genre: audioData.genre,
            subgenre: audioData.subgenre,
            category: audioData.category,
            index: playedSongsIndex
        }
            // If not found, add the new entry
            playedSongs.push(dataToStore);
            localStorage.setItem('currentPlayingIndex', dataToStore.index);
        }
        

        // Store the updated array back into localStorage
        localStorage.setItem('playedSongs', JSON.stringify(playedSongs));
    }


    // Function to play audio
    async function playAudio(index, startTime = 0) {
        const currentAudio = audioData[index];
        try {
            audioElement.currentTime = startTime; // Set current time to resume from the provided time

            await audioElement.play();
            addPlayedSong(currentAudio)
            playPause = 'play'
            localStorage.setItem('playPauseState', playPause);
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

    async function playStoredAudio(startTime){
        try {
            audioElement.currentTime = startTime; // Set current time to resume from the provided time
            await audioElement.play();
            playPause = 'play'
            localStorage.setItem('playPauseState', playPause);
            popupPlayAnimation.play(); // Start popup play animation
            popupPlayAnimation.addEventListener('complete', () => {
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
        playPause = "pause"
        localStorage.setItem('playPauseState', playPause);
        audioElement.pause();
        currentAudio.pauseAnimation.loop = false;
        popupPauseAnimation.loop = false;
        currentAudio.pauseAnimation.addEventListener('complete', () => {
            popupPauseAnimation.stop()
            currentAudio.pauseAnimation.stop();
            currentAudio.playingButton.style.display = 'none';
            currentAudio.playButton.style.display = 'block';
            popupPlayingButton.style.display = 'none';
            popupPlayButton.style.display = 'block';
            currentAudio.playAnimation.setDirection(-1);
            popupPlayAnimation.setDirection(-1);
            currentAudio.playAnimation.play();
            popupPlayAnimation.play();
            currentAudio.playAnimation.addEventListener('complete', () => {
                currentAudio.playAnimation.setDirection(1);
                popupPlayAnimation.setDirection(1);
                currentAudio.pauseAnimation.loop = true;
                popupPauseAnimation.loop = true;
                currentAudio.playingButton.style.display = 'none';
                currentAudio.playButton.style.display = 'block';
                popupPlayingButton.style.display = 'none';
                popupPlayButton.style.display = 'block';
            }, { once: true });
        }, { once: true });
        
    }

    async function pauseStoredAudio(){
        playPause = "pause"
        localStorage.setItem('playPauseState', playPause);
        audioElement.pause();
        popupPauseAnimation.loop = false;
        popupPauseAnimation.addEventListener('complete', () =>{
            popupPlayingButton.style.display = 'none';
            popupPlayButton.style.display = 'block';
            popupPlayAnimation.setDirection(-1);
            popupPlayAnimation.play();
            popupPlayAnimation.addEventListener('complete', () => {
                popupPlayAnimation.setDirection(1);
                popupPauseAnimation.loop = true;
                popupPlayingButton.style.display = 'none';
                popupPlayButton.style.display = 'block';
            }, { once: true });
        }, { once: true });
    }

    function updateProgressBar() {
        const popupPlayerDuration = document.getElementById('popup-player-duration');
        const popupPlayerCurrentTime = document.getElementById('popup-player-current-time');
        const popupProgressBar  = document.getElementById('popup-progress-bar');
        for (let i = 0; i < audioData.length; i++){
            let audioIndex = audioData[i];
            let productUrl = (audioIndex.url);
            productUrl = basePath + productUrl;
            if (productUrl == audioSource.src){
                let currentAudio = audioIndex;
                const currentTime = audioElement.currentTime.toFixed(2);
                const duration = audioElement.duration.toFixed(2);
                popupPlayerDuration.textContent = duration;
                popupPlayerCurrentTime.textContent = currentTime;
                const progressPercent = (currentTime / duration) * 100;
                currentAudio.progressBar.style.width = progressPercent + '%'; //Update the product car progress bar
                popupProgressBar.style.width = progressPercent + '%';  // Update popup progress bar

                if (currentTime >= duration -0.10) {
                    console.log('Audio has ended');
                    playPause = "pause"
                    localStorage.setItem('playPauseState', JSON.stringify(playPause));
                    audioElement.currentTime = 0; // Reset audio to start
                    pauseAudio(i); // Pause the audio to reset the UI
                }  
    
            localStorage.setItem('currentPlayingTime', currentTime);
            localStorage.setItem('currentDuration', duration);
            }
            else{
                // console.log("No Match Found");
                const currentTime = audioElement.currentTime.toFixed(2);
                const duration = audioElement.duration.toFixed(2);
                popupPlayerDuration.textContent = duration;
                popupPlayerCurrentTime.textContent = currentTime;
                const progressPercent = (currentTime / duration) * 100;
                popupProgressBar.style.width = progressPercent + '%';  // Update popup progress bar

                if (currentTime >= duration -0.10) {
                    playPause = "pause"
                    localStorage.setItem('playPauseState', JSON.stringify(playPause));
                    audioElement.currentTime = 0; // Reset audio to start
                    pauseStoredAudio(); // Pause the audio to reset the UI
                }     

                localStorage.setItem('currentPlayingTime', currentTime);
                localStorage.setItem('currentDuration', duration);
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

        if (popupPlayer.style.display === '' || popupPlayer.style.display === 'none') {
            popupPlayer.style.display = 'flex';
            localStorage.setItem('popupPlayerVisible', (popupPlayer.style.display));
        }


            if (audioElement.paused){
                playAudio(index, audioElement.currentTime); // Resume from the current time
            }
        
    }

    // Function to change audio audioPlayerData
    async function changeAudioPlayer(index) {
        let playedAudioData = JSON.parse(localStorage.getItem('playedSongs'));
        console.log(index);
        console.log(playedAudioData);
        if (!playedAudioData || index < 0 || index > playedAudioData.length) {
            console.log('Invalid index or no played songs data found.');
            return;
        }

        const popupProgressBar = document.getElementById('popup-progress-bar');
        let selectedAudio = playedAudioData[index];
        let newSrc = basePath + selectedAudio.url;
        audioSource.src = newSrc;
        audioElement.load();
        let storedTime = localStorage.getItem('currentPlayingTime');
        let duration = localStorage.getItem('currentDuration');
        audioElement.currentTime = storedTime; // Set current time to resume from the provided time

        // Update popup player details
        const popupPlayer = document.getElementById('popup-player');
        const popupPlayerImage = document.getElementById('popup-player-image');
        const popupPlayerTitle = document.getElementById('popup-player-title');
        const popupPlayerCategory = document.getElementById('popup-player-category');
        const popupPlayerGenre = document.getElementById('popup-player-genre');
        const popupPlayerSubgenre = document.getElementById('popup-player-subgenre');

        popupPlayerImage.src = selectedAudio.image;
        popupPlayerTitle.textContent = selectedAudio.title;
        popupPlayerCategory.textContent = selectedAudio.category;
        popupPlayerGenre.textContent = selectedAudio.genre;
        popupPlayerSubgenre.textContent = selectedAudio.subgenre;

        const popupPlayerDuration = document.getElementById('popup-player-duration');
        const popupPlayerCurrentTime = document.getElementById('popup-player-current-time');

        const currentTime = audioElement.currentTime.toFixed(2);
        const progressPercent = (currentTime / duration) * 100
        popupPlayerDuration.textContent = duration;
        popupPlayerCurrentTime.textContent = currentTime;
        popupPlayer.style.display = 'flex';
        popupProgressBar.style.width = progressPercent + '%';  // Update popup progress bar

    }

    
    // Event listener for timeupdate to update progress bars
    audioElement.addEventListener('timeupdate', updateProgressBar);


});