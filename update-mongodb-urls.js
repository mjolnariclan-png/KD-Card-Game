const { MongoClient } = require('mongodb');
const { v2: cloudinary } = require('cloudinary');

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://mjolnariclan17:JuPiTeR2015!@tcg-game-db.ak26dwh.mongodb.net/?appName=tcg-game-db';
const DB_NAME = 'tcg-game-db';

// Cloudinary Configuration
cloudinary.config({
    cloud_name: 'sywzs1w9',
    api_key: '387367841542543',
    api_secret: 'Ths41qxona37vsd6-VC6meebtTk'
});

async function updateMongoDBUrls() {
    let client;
    try {
        console.log('Connecting to MongoDB Atlas...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB Atlas');

        const db = client.db(DB_NAME);
        const setsCollection = db.collection('card_sets');
        
        // Get all card sets
        const sets = await setsCollection.find({}).toArray();
        console.log(`Found ${sets.length} card sets to update`);

        let totalUpdated = 0;

        for (const set of sets) {
            console.log(`\nProcessing ${set.set_name}...`);
            
            // Get the cards collection for this set
            const cardsCollection = db.collection(`cards_${set.set_name.replace(/\s+/g, '_')}`);
            const cards = await cardsCollection.find({}).toArray();
            
            console.log(`Found ${cards.length} cards to update`);

            for (const card of cards) {
                // Convert local paths to Cloudinary URLs
                let needsUpdate = false;
                const updatedCard = { ...card };

                // Update standard_path if it exists
                if (card.standard_path && typeof card.standard_path === 'string' && (card.standard_path.includes('B:\\Cards') || card.standard_path.includes('B:\\Sets'))) {
                    updatedCard.standard_path = convertToCloudinaryURL(card.standard_path, set.set_name);
                    needsUpdate = true;
                }

                // Update image field if it exists
                if (card.image && typeof card.image === 'string' && (card.image.includes('B:\\Cards') || card.image.includes('B:\\Sets'))) {
                    updatedCard.image = convertToCloudinaryURL(card.image, set.set_name);
                    needsUpdate = true;
                }

                // Update print_path if it exists
                if (card.print_path && typeof card.print_path === 'string' && (card.print_path.includes('B:\\Cards') || card.print_path.includes('B:\\Sets'))) {
                    updatedCard.print_path = convertToCloudinaryURL(card.print_path, set.set_name);
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await cardsCollection.updateOne(
                        { _id: card._id },
                        { $set: updatedCard }
                    );
                    totalUpdated++;
                }
            }

            console.log(`Updated ${cards.filter(c => c.standard_path && c.standard_path.includes('B\\')).length} cards for ${set.set_name}`);
        }

        console.log(`\n✅ Update complete!`);
        console.log(`Total cards updated: ${totalUpdated}`);
        
    } catch (error) {
        console.error('Error updating MongoDB URLs:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

function convertToCloudinaryURL(localPath, setName) {
    if (!localPath) return null;
    
    // If it's already a Cloudinary URL, return it as-is
    if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
        return localPath;
    }
    
    // Convert from B:\Cards\Chaos\Vigor\Chaos_Warpbinder.png
    // to Cloudinary URL with nested folders
    const path = require('path');
    const relativePath = localPath.replace('B:\\Cards', `B:\\Sets\\${setName}`);
    const fileName = path.basename(relativePath);
    const folderStructure = path.dirname(relativePath).replace('B:\\Sets\\', '').replace(/\\/g, '/');
    
    // Generate Cloudinary URL with nested folder structure
    const fullFolderPath = `tcg-cards/${folderStructure}`;
    const publicId = fileName.replace(/\.[^/.]+$/, '');
    return cloudinary.url(`${fullFolderPath}/${publicId}`);
}

updateMongoDBUrls();