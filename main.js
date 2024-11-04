const yargs = require('yargs');
const globals = require('./globals');
const config = require('./config');
const logger = require('./modules/logger');
const { collectSketchIds } = require('./modules/listSketches');
const { fetchSketchInfo } = require('./modules/fetchMetadata');
const { downloadSketch } = require('./modules/downloadSketch');
const { ensureDirectoryExists } = require('./modules/utils');

// Set up command-line arguments
const argv = yargs
    .option('term', {
        alias: 't',
        type: 'string',
        description: 'Search term for sketches (activates SEARCH_BY_TERM mode)',
        coerce: (arg) => {
            if (arg) {
                config.SEARCH_MODE = config.Mode.SEARCH_BY_TERM;
                config.SEARCH_TERM = arg;
            }
            return arg;
        }
    })
    .option('user', {
        alias: 'u',
        type: 'string',
        description: 'User ID for searching sketches by user',
        coerce: (arg) => {
            if (arg) {
                config.SEARCH_MODE = config.Mode.SEARCH_BY_USER_ID;
                config.USER_ID = arg;
            }
            return arg;
        }
    })
    .option('curation', {
        alias: 'c',
        type: 'string',
        description: 'Curation ID for searching curated sketches',
        coerce: (arg) => {
            if (arg) {
                config.SEARCH_MODE = config.Mode.SEARCH_BY_CURATION_ID;
                config.CURATION_ID = arg;
            }
            return arg;
        }
    })
    .option('sketch', {
        alias: 'k',
        type: 'string',
        description: 'Sketch ID for fetching a specific sketch',
        coerce: (arg) => {
            if (arg) {
                config.SEARCH_MODE = config.Mode.SEARCH_BY_SKETCH_ID;
                config.SKETCH_ID = arg;
            }
            return arg;
        }
    })
    .option('downloadAssets', {
        alias: 'a',
        type: 'boolean',
        description: 'Download assets (images, sounds, etc.)',
        default: false,
    })
    .option('skipForks', {
        alias: 'f',
        type: 'boolean',
        description: 'Skip downloading forks of sketches',
        default: false,
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Enable verbose logging',
        default: false,
    })
    .help()
    .argv;

// Override config values with command-line arguments
config.DOWNLOAD_ASSETS = argv.downloadAssets;
config.SKIP_FORKS = argv.skipForks;
config.VERBOSE = argv.verbose;

const main = async () => {
    // Ensure the save directory exists
    ensureDirectoryExists(globals.SAVE_DIR);

    // Collect sketch IDs based on search mode
    const sketchIds = await collectSketchIds();
    logger.log(`🧮 Total sketches to process: ${sketchIds.length}`);

    if(!config.DOWNLOAD_ASSETS){
        logger.warn(`🚨 Asset downloading is disabled.`);
    }

    let processedCount = 0;

    for (const sketchId of sketchIds) {
        const sketchInfo = await fetchSketchInfo(sketchId);
    
        if (!sketchInfo) {
            console.log(`Skipping sketch ID: ${sketchId} due to failed information gathering`);
            continue;
        }
    
        logger.logSeparator();
        logger.logSketchInfo(sketchInfo);

        // Skip hidden code sketches
        if (sketchInfo.hiddenCode) {
            logger.log('🙈 The code for this sketch is not available publicly.');
            logger.log('👻 Skipping...');
            continue;
         }
    
        // Skip forks if configured
        if (sketchInfo.isFork && config.SKIP_FORKS) {
            if (config.VERBOSE) {
                logger.lineBreak();
                logger.logParentInfo(sketchInfo.parent);
                logger.lineBreak();
                logger.log(`🔱 This sketch is a fork.`);
                logger.log('👻 Skipping...');
            }
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
        processedCount++; // Increment processedCount after successful download
    }    

    console.log(`\n✅ Downloaded ${processedCount} sketches to ${globals.SAVE_DIR}`); // Use processedCount instead of sketchIds.length
};

// Execute the main function
main();
