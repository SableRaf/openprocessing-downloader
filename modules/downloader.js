const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config');
const { ensureDirectoryExists, sanitizeFilename } = require('./utils');
const { generateIndexHtml } = require('./htmlGenerator');

/**
 * Downloads the sketch code parts, metadata, and thumbnail image (if available) to the specified directory.
 * @param {Object} sketchInfo - The sketch information object.
 * @param {number} sketchInfo.sketchId - The ID of the sketch.
 * @param {Array<Object>} sketchInfo.codeParts - The code parts of the sketch.
 * @param {Array<Object>} sketchInfo.files - The files associated with the sketch.
 * @param {boolean} sketchInfo.htmlMode - Indicates if the sketch is in HTML mode.
 * @param {Array<Object>} sketchInfo.libraries - The libraries associated with the sketch.
 * @param {Object} sketchInfo.metadata - The metadata of the sketch.
 * @returns {Promise<void>} A Promise that resolves when the sketch is downloaded.
 * @async
 */
const downloadSketch = async (sketchInfo) => {
    const sketchId = sketchInfo.sketchId;
    const sketchDir = path.join(config.SAVE_DIR, `sketch_${sketchId}`);

    // Ensure the sketch directory exists
    ensureDirectoryExists(sketchDir);

    // Save code parts to files and collect filenames for non-HTML sketches
    const savedCodePartsFilenames = [];

    sketchInfo.codeParts.forEach((codeBlock, index) => {
        let codeFileName = path.basename(codeBlock.title);

        // Ensure the file has an extension, default to .js if missing
        let fileExtension = path.extname(codeFileName);
        if (!fileExtension) {
            fileExtension = '.js';
            codeFileName += fileExtension;
        }

        // Sanitize filename and write file
        codeFileName = sanitizeFilename(codeFileName);
        const codeFilePath = path.join(sketchDir, codeFileName);
        fs.writeFileSync(codeFilePath, codeBlock.code);

        // Collect non-HTML code files for later use
        savedCodePartsFilenames.push(codeFileName);
    });

    // Generate index.html if not in HTML mode
    if (!sketchInfo.htmlMode) {
        generateIndexHtml(sketchInfo.metadata, sketchInfo.codeParts, sketchDir);
    } 

    // Create metadata directory
    const metadataDir = path.join(sketchDir, config.META_DIR);
    ensureDirectoryExists(metadataDir);

    // Save metadata to a JSON file
    const metadataFilePath = path.join(metadataDir, 'metadata.json');
    fs.writeFileSync(metadataFilePath, JSON.stringify(sketchInfo.metadata, null, 2));

    // Download thumbnail if available
    if (sketchInfo.metadata.visualID) {
        const imageUrl = config.THUMBNAIL_URL_TEMPLATE.replace('{visualID}', sketchInfo.metadata.visualID);
        const imageFilePath = path.join(metadataDir, 'thumbnail.jpg');
        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(imageFilePath, response.data);
        } catch (error) {
            // console.log(`No thumbnail available.`);
        }
    }
};

module.exports = { downloadSketch };
