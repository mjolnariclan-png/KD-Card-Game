const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://mjolnariclan17:JuPiTeR2015!@tcg-game-db.ak26dwh.mongodb.net/?appName=tcg-game-db';
const DB_NAME = 'tcg-game-db';

async function findLocalPaths() {
    let client;
    try {
        console.log('Connecting to MongoDB Atlas...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB Atlas');

        const db = client.db(DB_NAME);
        const setsCollection = db.collection('card_sets');
        
        const sets = await setsCollection.find({}).toArray();
        let totalLocalPaths = 0;
        
        for (const set of sets) {
            const cardsCollection = db.collection(`cards_${set.set_name.replace(/\s+/g, '_')}`);
            const cardsWithLocalPaths = await cardsCollection.find({
                $or: [
                    { standard_path: { $regex: /F:/i } },
                    { image: { $regex: /F:/i } },
                    { print_path: { $regex: /F:/i } },
                    { standard_path: { $regex: /B:/i } },
                    { image: { $regex: /B:/i } },
                    { print_path: { $regex: /B:/i } }
                ]
            }).toArray();
            
            if (cardsWithLocalPaths.length > 0) {
                console.log(`\n${set.set_name}: ${cardsWithLocalPaths.length} cards with local paths`);
                cardsWithLocalPaths.forEach(card => {
                    console.log(`  - ${card.name}: ${card.image}`);
                });
                totalLocalPaths += cardsWithLocalPaths.length;
            }
        }
        
        console.log(`\nTotal cards with local paths: ${totalLocalPaths}`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\nMongoDB connection closed');
        }
    }
}

findLocalPaths();