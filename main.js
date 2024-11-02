const globals = require('./globals');
const config = require('./config');
const logger = require('./modules/logger');
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
    
        if (!sketchInfo) {
            console.log(`Skipping sketch ID: ${sketchId} due to failed information gathering`);
            continue;
        }
    
        logger.logSeparator();
        logger.logSketchInfo(sketchInfo);
    
        if (sketchInfo.isFork && config.SKIP_FORKS) {
            if (config.VERBOSE) {
                logger.lineBreak();
                logger.logParentInfo(sketchInfo.parent);
            }
            logger.lineBreak();
            logger.logMessage(`👻 Skipping fork. This sketch will not be downloaded.`);
            continue;
        }
    
        if (config.VERBOSE) {
            logger.lineBreak();
            logger.logCodeParts(sketchInfo.codeParts);
            logger.logAssets(sketchInfo.files);
            logger.logLibraries(sketchInfo.libraries);
            if (sketchInfo.isFork) {
                logger.lineBreak();
                logger.logParentInfo(sketchInfo.parent);
            }
        }
    
        await downloadSketch(sketchInfo);
    }    

    console.log(`\n✅ Downloaded ${sketchIds.length} sketches to ${globals.SAVE_DIR}`);
};

// Execute the main function
main();