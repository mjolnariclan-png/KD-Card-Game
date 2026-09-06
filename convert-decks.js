const fs = require('fs');
const path = require('path');

// Read the all_decks_manifest.json
const manifestPath = 'B:\\Decks\\all_decks_manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Output directory for simplified decks
const outputDir = 'F:\\zzz\\test game\\decks';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Converting ${manifest.total_decks} decks to simplified format...`);

let convertedCount = 0;
let errorCount = 0;

manifest.decks.forEach(deck => {
    try {
        const deckManifestPath = deck.manifest_path;
        
        if (!fs.existsSync(deckManifestPath)) {
            console.log(`⚠️  Skipping ${deck.deck_name} - file not found: ${deckManifestPath}`);
            errorCount++;
            return;
        }
        
        const deckData = JSON.parse(fs.readFileSync(deckManifestPath, 'utf8'));
        
        // The deck files are already in simplified format, just copy them
        const simplifiedDeck = {
            deck_name: deckData.deck_name || deck.deck_name,
            set: deckData.set || deck.set,
            vigor: deckData.vigor || deck.vigor,
            cards: deckData.cards || []
        };
        
        // Verify total cards
        const totalCards = simplifiedDeck.cards.reduce((sum, card) => sum + (card.quantity || 0), 0);
        if (totalCards !== 60) {
            console.log(`⚠️  ${deck.deck_name}: ${totalCards} cards (expected 60)`);
        }
        
        // Save simplified deck
        const safeDeckName = deck.deck_name.replace(/[^a-zA-Z0-9_-]/g, '_');
        const outputPath = path.join(outputDir, `${safeDeckName}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(simplifiedDeck, null, 2));
        
        console.log(`✅ Converted: ${deck.deck_name} (${deck.set} - ${deck.vigor})`);
        convertedCount++;
        
    } catch (error) {
        console.error(`❌ Error converting ${deck.deck_name}:`, error.message);
        errorCount++;
    }
});

console.log(`\nConversion complete:`);
console.log(`✅ Successfully converted: ${convertedCount} decks`);
console.log(`❌ Errors: ${errorCount} decks`);
console.log(`📁 Output directory: ${outputDir}`);