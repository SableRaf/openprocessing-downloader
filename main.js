// main.js
const { scrapeSketchIds } = require('./modules/scraper');
const { gatherSketchInfo } = require('./modules/fetcher');
const { downloadSketch } = require('./modules/downloader');
const { ensureDirectoryExists } = require('./modules/utils');
const config = require('./config');

const main = async () => {

    // Ensure the save directory exists
    ensureDirectoryExists(config.SAVE_DIR);

    const sketchIds = await scrapeSketchIds();
    console.log(`ℹ️ Total sketches to process: ${sketchIds.length}`);

    for (const sketchId of sketchIds) {
        console.log(`\nID: ${sketchId}`);
        const sketchInfo = await gatherSketchInfo(sketchId);
        if (sketchInfo) {
            await downloadSketch(sketchInfo);
        } else {
            console.log(`Skipping sketch ID: ${sketchId} due to failed information gathering`);
        }
    }

    console.log('\n✅ Script execution finished');
};

// Execute the main function
main();