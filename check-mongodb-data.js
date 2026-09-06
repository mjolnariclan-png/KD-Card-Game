const { MongoClient } = require('mongodb');

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://mjolnariclan17:JuPiTeR2015!@tcg-game-db.ak26dwh.mongodb.net/?appName=tcg-game-db';
const DB_NAME = 'tcg-game-db';

async function checkMongoDBData() {
    let client;
    try {
        console.log('Connecting to MongoDB Atlas...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB Atlas');

        const db = client.db(DB_NAME);
        const setsCollection = db.collection('card_sets');
        
        // Check First Light set (since user saw errors from it)
        const set = await setsCollection.findOne({ set_name: 'First Light' });
        
        if (set) {
            console.log(`\nChecking data for ${set.set_name}...`);
            
            // Get the cards collection for this set
            const cardsCollection = db.collection(`cards_${set.set_name.replace(/\s+/g, '_')}`);
            const cards = await cardsCollection.find({}).limit(5).toArray();
            
            console.log(`\nSample card data (first 5 cards):`);
            for (const card of cards) {
                console.log(`\nCard: ${card.name}`);
                console.log(`  standard_path: ${card.standard_path}`);
                console.log(`  image: ${card.image}`);
                console.log(`  print_path: ${card.print_path}`);
            }
        }
        
    } catch (error) {
        console.error('Error checking MongoDB data:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\nMongoDB connection closed');
        }
    }
}

checkMongoDBData();