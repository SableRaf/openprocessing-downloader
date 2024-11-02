const globals = require('./globals');
const config = require('./config');
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
            if (config.SKIP_FORKS && sketchInfo.isFork) {
                console.log(`👻 Skipping fork. This sketch will not be downloaded.`);
                continue;
            }
            await downloadSketch(sketchInfo);
        } else {
            console.log(`Skipping sketch ID: ${sketchId} due to failed information gathering`);
        }
    }

    console.log(`\n✅ Downloaded ${sketchIds.length} sketches to ${globals.SAVE_DIR}`);
};

// Execute the main function
main();