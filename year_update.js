document.addEventListener('DOMContentLoaded', function() {

    const yearElement = document.querySelector("#year-text-id");
    const currentYear = new Date().getFullYear().toString();
    yearElement.textContent = currentYear;
    console.log("Year updated to", currentYear);
    console.log("hello")
});