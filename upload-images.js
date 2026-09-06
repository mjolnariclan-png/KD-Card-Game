const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');

// Cloudinary Configuration
cloudinary.config({
    cloud_name: 'sywzs1w9',
    api_key: '387367841542543',
    api_secret: 'Ths41qxona37vsd6-VC6meebtTk'
});

async function uploadCardImages() {
    const setsPath = 'B:\\Sets';
    
    if (!fs.existsSync(setsPath)) {
        console.error('Sets directory not found at B:\\Sets');
        return;
    }

    const sets = fs.readdirSync(setsPath).filter(dir => {
        const dirPath = path.join(setsPath, dir);
        return fs.statSync(dirPath).isDirectory();
    });

    console.log(`Found ${sets.length} card sets to process`);
    let totalUploaded = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const setName of sets) {
        console.log(`\nProcessing ${setName}...`);
        
        // Walk through all subdirectories to find images
        const setImagePath = path.join(setsPath, setName);
        const result = await uploadImagesFromDirectory(setImagePath, setName);
        totalUploaded += result.uploaded;
        totalSkipped += result.skipped;
        totalErrors += result.errors;
    }

    console.log(`\n✅ Upload complete!`);
    console.log(`Total uploaded: ${totalUploaded}`);
    console.log(`Total skipped (already exists): ${totalSkipped}`);
    console.log(`Total errors: ${totalErrors}`);
}

async function uploadImagesFromDirectory(dirPath, setPrefix) {
    const items = fs.readdirSync(dirPath);
    let uploaded = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            // Recursively process subdirectories
            const result = await uploadImagesFromDirectory(itemPath, setPrefix);
            uploaded += result.uploaded;
            skipped += result.skipped;
            errors += result.errors;
        } else if (stat.isFile() && isImageFile(item)) {
            // Upload image file
            const result = await uploadSingleImage(itemPath, setPrefix);
            if (result === 'uploaded') uploaded++;
            else if (result === 'skipped') skipped++;
            else errors++;
        }
    }
    
    return { uploaded, skipped, errors };
}

function isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
}

async function uploadSingleImage(imagePath, setPrefix) {
    try {
        // Check if already uploaded (avoid duplicates)
        const relativePath = path.relative('B:\\Sets', imagePath);
        const publicId = relativePath.replace(/\\/g, '/').replace(/\.[^/.]+$/, '');
        
        // Check if already exists in Cloudinary
        try {
            const existingResource = await cloudinary.api.resource(publicId, {
                type: 'upload',
                resource_type: 'image'
            });
            
            if (existingResource) {
                console.log(`⏭️  Skipped (already exists): ${relativePath}`);
                return 'skipped';
            }
        } catch (error) {
            // Resource doesn't exist, proceed with upload
            if (error.http_code !== 404) {
                console.log(`⏭️  Skipped (error checking): ${relativePath}`);
                return 'skipped';
            }
        }
        
        const result = await cloudinary.uploader.upload(imagePath, {
            public_id: publicId,
            folder: 'tcg-cards',
            resource_type: 'image',
            overwrite: false // Don't overwrite existing images
        });
        
        console.log(`✅ Uploaded: ${relativePath} -> ${result.secure_url}`);
        return 'uploaded';
    } catch (error) {
        console.error(`❌ Error uploading ${imagePath}:`, error.message);
        return 'error';
    }
}

uploadCardImages();