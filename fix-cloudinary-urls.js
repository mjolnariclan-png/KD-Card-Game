const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://mjolnariclan17:JuPiTeR2015!@tcg-game-db.ak26dwh.mongodb.net/?appName=tcg-game-db';
const DB_NAME = 'tcg-game-db';

async function fixCloudinaryURLs() {
    let client;
    try {
        console.log('Connecting to MongoDB Atlas...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB Atlas');

        const db = client.db(DB_NAME);
        const setsCollection = db.collection('card_sets');
        
        const sets = await setsCollection.find({}).toArray();
        let totalFixed = 0;
        
        for (const set of sets) {
            const cardsCollection = db.collection(`cards_${set.set_name.replace(/\s+/g, '_')}`);
            
            // Find cards with ANY URL containing local paths (including malformed Cloudinary URLs)
            const cardsWithBadURLs = await cardsCollection.find({
                $or: [
                    { standard_path: { $regex: /F:/i } },
                    { image: { $regex: /F:/i } },
                    { print_path: { $regex: /F:/i } },
                    { standard_path: { $regex: /B:/i } },
                    { image: { $regex: /B:/i } },
                    { print_path: { $regex: /B:/i } }
                ]
            }).toArray();
            
            if (cardsWithBadURLs.length > 0) {
                console.log(`\nFixing ${cardsWithBadURLs.length} cards in ${set.set_name}...`);
                
                for (const card of cardsWithBadURLs) {
                    const updates = {};
                    
                    // Remove malformed URLs entirely and let frontend use standard_path with fallbacks
                    if (card.image && (card.image.includes('F:/') || card.image.includes('B:/'))) {
                        updates.image = null; // Clear the bad URL
                    }
                    
                    if (card.print_path && (card.print_path.includes('F:/') || card.print_path.includes('B:/'))) {
                        updates.print_path = null; // Clear the bad URL
                    }
                    
                    if (card.standard_path && (card.standard_path.includes('F:/') || card.standard_path.includes('B:/'))) {
                        updates.standard_path = null; // Clear the bad URL
                    }
                    
                    if (Object.keys(updates).length > 0) {
                        await cardsCollection.updateOne(
                            { _id: card._id },
                            { $set: updates }
                        );
                        totalFixed++;
                    }
                }
            }
        }
        
        console.log(`\n✅ Cleared ${totalFixed} malformed URLs`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\nMongoDB connection closed');
        }
    }
}

fixCloudinaryURLs();