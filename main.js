const { collectSketchIds } = require('./modules/sketchCollector');
const { fetchSketchInfo } = require('./modules/metadataFetcher');
const { downloadSketch } = require('./modules/sketchDownloader');
const { ensureDirectoryExists } = require('./modules/utils');
const config = require('./config');
const globals = require('./globals');

const main = async () => {
    // Ensure the save directory exists
    ensureDirectoryExists(globals.SAVE_DIR);

    // Set up options for collecting sketch IDs
    const idCollectorOptions = {
        searchMode: config.SEARCH_MODE, // used to determine the search mode (search term, user ID, or curation ID)
        searchQuery: config.SEARCH_TERM, // used to download sketches based on search term
        userId: config.USER_ID, // used to download sketches from a specific user
        curationId: config.CURATION_ID, // used to download sketches from a specific curation
        searchUrlBase: globals.SEARCH_URL_BASE,
        userSketchesUrlBase: globals.USER_SKETCHES_URL_BASE,
        curationUrlBase: globals.CURATION_URL_BASE,
        headless: globals.HEADLESS,
    };

    // Collect sketch IDs based on search mode
    const sketchIds = await collectSketchIds(idCollectorOptions);
    console.log(`🧮 Total sketches to process: ${sketchIds.length}`);

    for (const sketchId of sketchIds) {
        const sketchInfo = await fetchSketchInfo(sketchId);
        if (sketchInfo) {
            await downloadSketch(sketchInfo);
        } else {
            console.log(`Skipping sketch ID: ${sketchId} due to failed information gathering`);
        }
    }

    console.log(`\n✅ Downloaded ${sketchIds.length} sketches to ${globals.SAVE_DIR}`);
};

// Execute the main function
main();