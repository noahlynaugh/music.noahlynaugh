
export function updateYear() {
    const TextElement = document.querySelectorAll("#year-text-id");
    const currentYear = new Date().getFullYear().toString();
    // Loop through all the selected footer elements and update their textContent
    TextElement.forEach((TextElement) => {
        TextElement.textContent = TextElement.textContent.replace("*Year*", currentYear);
        console.log("Loading the current year... the year is", currentYear);
    });
}