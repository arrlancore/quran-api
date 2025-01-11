const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

async function getAllSurahs() {
  const allSurahs = [];

  // Get the root directory path (2 levels up from the current script)
  const rootDir = path.join(__dirname, "..");

  // Define the output directory and file
  const dataDir = path.join(rootDir, "data");
  const outputFile = path.join(dataDir, "equran-id.json");

  // Create data directory if it doesn't exist
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      console.error("Error creating directory:", error);
      return;
    }
  }

  for (let surahNumber = 1; surahNumber <= 114; surahNumber++) {
    try {
      const url = `http://equran.id/api/v2/surat/${surahNumber}`;

      const response = await axios.get(url);
      allSurahs.push(response.data);

      console.log(`Surah ${surahNumber} collected successfully`);

      // Add a small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error fetching Surah ${surahNumber}:`, error.message);
    }
  }

  try {
    // Stringify without any custom replacer
    const jsonContent = JSON.stringify(allSurahs).replace(/[\u007F-\uFFFF]|[\u0000-\u007F][\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(chr) {
      if (chr.length === 1) {
          return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
      } else {
          // Handle surrogate pairs
          const high = chr.charCodeAt(1);
          const low = chr.charCodeAt(2);
          const codePoint = ((high - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
          return '\\u' + ('000000' + codePoint.toString(16)).slice(-6);
      }
    })

    // Write the file as is, without any Unicode conversion
    await fs.writeFile(outputFile, jsonContent, 'utf8');
    console.log(`All surahs have been saved to ${outputFile}`);
  } catch (error) {
    console.error('Error saving file:', error);
  }
}

// Run the scraper
getAllSurahs();
