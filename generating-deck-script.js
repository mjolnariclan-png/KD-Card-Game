// Function to update the progress bar
const updateProgress = (currentCard, totalCards) => {
    const progressBar = document.getElementById("progress-bar");
    const progressText = document.getElementById("progress-text");

    if (!progressBar || !progressText) {
        console.error("Progress bar or progress text element not found.");
        return;
    }

    // Calculate progress percentage
    const progressPercentage = (currentCard / totalCards) * 100;

    // Update progress bar width
    progressBar.style.width = progressPercentage + "%";

    // Update progress text
    progressText.textContent = `Loading... (${currentCard}/${totalCards})`;

    console.log(`Progress updated: ${progressPercentage}%`);
};

// Function to simulate generating the deck
const generateDeck = (totalCards, mode) => {
    let generatedCards = 0; // Counter for generated cards

    // Simulate generating each card
    const interval = setInterval(() => {
        if (generatedCards < totalCards) {
            generatedCards++;
            updateProgress(generatedCards, totalCards);
        } else {
            clearInterval(interval);
            console.log("Deck generation complete. Redirecting...");
            // Redirect to the appropriate battlefield based on mode
            if (mode === 'multiplayer') {
                window.location.href = "multiplayer.html";
            } else {
                window.location.href = "battlefield.html";
            }
        }
    }, 500); // Interval in milliseconds
};

// Start generating the deck when the page loads
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed.");
    const queryParams = new URLSearchParams(window.location.search);
    const deckSize = parseInt(queryParams.get("deck-size"));
    const mode = queryParams.get("mode") || 'ai';

    console.log(`Deck size from URL: ${deckSize}`);
    console.log(`Mode from URL: ${mode}`);

    if (!isNaN(deckSize) && deckSize >= 10 && deckSize <= 100) {
        generateDeck(deckSize, mode);
    } else {
        console.error("Invalid deck size.");
        alert("Invalid deck size."); // Debugging statement
        // Optionally, redirect to an error page or handle the error appropriately
        // window.location.href = "error-page.html"; // Change URL as needed
    }
});
