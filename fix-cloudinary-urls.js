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
            
            // Find cards with malformed Cloudinary URLs containing local paths
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
                    
                    // Fix standard_path
                    if (card.standard_path && (card.standard_path.includes('F:/') || card.standard_path.includes('B:/'))) {
                        // Remove the local path part and use a placeholder
                        const fileName = card.file_name || card.name + '.png';
                        updates.standard_path = `https://res.cloudinary.com/sywzs1w9/image/upload/v1/tcg-cards/${set.set_name.replace(/\s+/g, '%20')}/${fileName}`;
                    }
                    
                    // Fix image
                    if (card.image && (card.image.includes('F:/') || card.image.includes('B:/'))) {
                        const fileName = card.file_name || card.name + '.png';
                        updates.image = `https://res.cloudinary.com/sywzs1w9/image/upload/v1/tcg-cards/${set.set_name.replace(/\s+/g, '%20')}/${fileName}`;
                    }
                    
                    // Fix print_path
                    if (card.print_path && (card.print_path.includes('F:/') || card.print_path.includes('B:/'))) {
                        const fileName = card.file_name || card.name + '.png';
                        updates.print_path = `https://res.cloudinary.com/sywzs1w9/image/upload/v1/tcg-cards/${set.set_name.replace(/\s+/g, '%20')}/${fileName}`;
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
        
        console.log(`\n✅ Fixed ${totalFixed} card URLs`);
        
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