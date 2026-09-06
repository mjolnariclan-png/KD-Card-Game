document.getElementById("deck-selection-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from submitting the traditional way
    const deckSize = document.getElementById("deck-size").value;
    const vigorType = document.getElementById("vigor-type").value;
    
    // Get mode from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'ai';

    if (deckSize >= 60 && deckSize <= 100) {
        const url = `generating-deck.html?deck-size=${deckSize}&vigor-type=${vigorType}&mode=${mode}`;
        window.location.href = url;
    } else {
        alert("Please enter a deck size between 60 and 100.");
    }
});
