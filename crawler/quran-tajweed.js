const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function getAllSurahs() {
    const allSurahs = [];

    // Get the root directory path (2 levels up from the current script)
    const rootDir = path.join(__dirname, '..');

    // Define the output directory and file
    const dataDir = path.join(rootDir, 'data');
    const outputFile = path.join(dataDir, 'quran-tajweed.json');

    // Create data directory if it doesn't exist
    try {
        await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.error('Error creating directory:', error);
            return;
        }
    }

    for (let surahNumber = 1; surahNumber <= 114; surahNumber++) {
        try {
            const url = `http://api.alquran.cloud/v1/surah/${surahNumber}/quran-tajweed`;

            const response = await axios.get(url);
            allSurahs.push(response.data);

            console.log(`Surah ${surahNumber} collected successfully`);

            // Add a small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`Error fetching Surah ${surahNumber}:`, error.message);
        }
    }

    try {
        await fs.writeFile(outputFile, JSON.stringify(allSurahs, null, 2));
        console.log(`All surahs have been saved to ${outputFile}`);
    } catch (error) {
        console.error('Error saving file:', error);
    }
}

// Run the scraper
getAllSurahs();
