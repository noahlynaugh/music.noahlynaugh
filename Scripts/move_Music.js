import { gsap } from "gsap"; 
import SplitText from "gsap/SplitText"; 
import { relative } from "path";
gsap.registerPlugin(SplitText); 

export function moveMusic(selector) {
     const split = new SplitText(selector, { type: "chars" });
      const letters = split.chars; letters.forEach((letter, i) => {
        // Prepare the letter for gradient text 
        letter.style.color = "transparent"; letter.style.backgroundClip = "text";
        letter.style.webkitBackgroundClip = "text"; 
        letter.style.display = "inline-block";
        // Create a wide gradient for smooth movement 
        letter.style.backgroundImage = `linear-gradient(90deg, 
            hsl(${Math.random() * 360}, 80%, 50%),
             hsl(${Math.random() * 360}, 80%, 50%),
              hsl(${Math.random() * 360}, 80%, 50%))`; 
        letter.style.backgroundSize = "200% 100%";
        // wider than letter for sliding effect 
        letter.style.backgroundPosition = "0% 0%"; 
        // Animate font weight pulsing 
        const style = window.getComputedStyle(letter); 
        const fontWeightMatch = style.fontVariationSettings?.match(/"wght"\s*(\d+)/); 
        const baseWeight = fontWeightMatch ? parseInt(fontWeightMatch[1]) : 400;
        
        gsap.fromTo( letter,
            { fontVariationSettings: `"wght" ${baseWeight}` },
            { fontVariationSettings: `"wght" ${baseWeight - 300}`, 
                duration: 1.2, ease: "power3.inOut", 
                yoyo: true, 
                repeat: -1, 
                delay: i * 0.33, 
            } 
        ); 
        
        // Animate gradient sliding 
        gsap.to(selector,
            { backgroundPosition: "200% 0%",
            duration: 3 + Math.random() * 2, 
            // slightly different speed per letter 
            ease: "inOut",
            repeat: -1,
            delay: i * 2,
            }
        );
    })
}
