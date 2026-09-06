// Load available card sets
async function loadCardSets() {
    try {
        const response = await fetch('/api/sets');
        const data = await response.json();
        if (data.success) {
            const cardSetSelect = document.getElementById('card-set');
            cardSetSelect.innerHTML = '<option value="">Select a set...</option>';
            data.sets.forEach(set => {
                const option = document.createElement('option');
                option.value = set.name;
                option.textContent = `${set.name} (${set.manifest ? set.manifest.base_total : 'Unknown'} cards)`;
                cardSetSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading card sets:', error);
        // Fallback to default set
        const cardSetSelect = document.getElementById('card-set');
        cardSetSelect.innerHTML = '<option value="Ash Cycle">Ash Cycle (Default)</option>';
    }
}

// Load sets when page loads
document.addEventListener("DOMContentLoaded", loadCardSets);

document.getElementById("deck-selection-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from submitting the traditional way
    const cardSet = document.getElementById("card-set").value;
    const deckSize = document.getElementById("deck-size").value;
    const vigorType = document.getElementById("vigor-type").value;

    // Get mode from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'ai';

    if (!cardSet) {
        alert("Please select a card set.");
        return;
    }

    if (deckSize >= 60 && deckSize <= 100) {
        const url = `generating-deck.html?card-set=${encodeURIComponent(cardSet)}&deck-size=${deckSize}&vigor-type=${vigorType}&mode=${mode}`;
        window.location.href = url;
    } else {
        alert("Please enter a deck size between 60 and 100.");
    }
});
