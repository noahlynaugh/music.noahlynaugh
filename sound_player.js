// JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const audioElement = document.getElementById('audio');
    const playGraphicContainer = document.querySelector('.play-button');
    const pauseGraphicContainer = document.querySelector('.playing-button');
    const progressBar = document.querySelector('.progress-bar');


    let playAnimation = lottie.loadAnimation({
        container: playGraphicContainer,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'https://cdn.prod.website-files.com/63d57f679309cee3851d5bd0/6660db983499aff763170beb_Play_to_Playing.json'
    });

    let pauseAnimation = lottie.loadAnimation({
        container: pauseGraphicContainer,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: 'https://cdn.prod.website-files.com/63d57f679309cee3851d5bd0/6660db9885695d761361c9ad_Playing_Loop.json'
    });

    // Function to play audio
    const playAudio = () => {
        audioElement.play().then(() => {
            logMessage('Audio is playing');
            playAnimation.play();
            playAnimation.addEventListener('complete', () => {
                playGraphicContainer.style.display = 'none';
                pauseGraphicContainer.style.display = 'block';
                pauseAnimation.play();
            }, { once: true });
        });
    };

    // Function to pause audio
    const pauseAudio = () => {
        audioElement.pause();
        pauseAnimation.loop = false;
        pauseAnimation.addEventListener('complete', () => {
            pauseAnimation.stop();
            pauseGraphicContainer.style.display = 'none';
            playGraphicContainer.style.display = 'block';
            playAnimation.setDirection(-1);
            playAnimation.play();
            playAnimation.addEventListener('complete', () => {
                playAnimation.setDirection(1);
                pauseAnimation.loop = true;
                pauseGraphicContainer.style.display = 'none';
                playGraphicContainer.style.display = 'block';
            }, { once: true });
        }, { once: true });
    };

    // Function to update progress bar
    const updateProgressBar = () => {
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = progressPercent + '%';
        if (progressPercent === 100) {
            pauseAnimation.loop = false;
            pauseAnimation.addEventListener('complete', () => {
                pauseAnimation.stop();
                pauseGraphicContainer.style.display = 'none';
                playGraphicContainer.style.display = 'block';
                playAnimation.setDirection(-1);
                playAnimation.play();
                playAnimation.addEventListener('complete', () => {
                    playAnimation.setDirection(1);
                    pauseAnimation.loop = true;
                    pauseGraphicContainer.style.display = 'none';
                    playGraphicContainer.style.display = 'block';
                }, { once: true });
            }, { once: true });
        }
    };

    // Click event listeners
    playGraphicContainer.addEventListener('click', playAudio);
    pauseGraphicContainer.addEventListener('click', pauseAudio);

    // Touch event listeners
    playGraphicContainer.addEventListener('touchstart', playAudio);
    pauseGraphicContainer.addEventListener('touchstart', pauseAudio);

    // Update progress bar during audio playback
    audioElement.addEventListener('timeupdate', updateProgressBar);
});
