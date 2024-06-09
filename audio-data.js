const cmsAudios = document.querySelectorAll('[audio-data="url"]');

let audioUrls = [];

for (let cmsAudio of cmsAudios) {
    audioUrls.push(cmsAudio.innerHTML);
}

console.log(audioUrls);