const globals = require('./globals');
const { collectSketchIds } = require('./modules/listSketches');
const { fetchSketchInfo } = require('./modules/fetchMetadata');
const { downloadSketch } = require('./modules/downloadSketch');
const { ensureDirectoryExists } = require('./modules/utils');

const main = async () => {
    // Ensure the save directory exists
    ensureDirectoryExists(globals.SAVE_DIR);

    // Collect sketch IDs based on search mode
    const sketchIds = await collectSketchIds();
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