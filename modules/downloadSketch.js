// modules/downloadSketch.js

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const globals = require('../globals');
const config = require('../config');
const { ensureDirectoryExists, sanitizeFilename, resolveAssetUrl } = require('./utils');
const { generateIndexHtml } = require('./generateIndexHtml');

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
    const sketchDir = path.join(globals.SAVE_DIR, `sketch_${sketchId}`);

    // Ensure the sketch directory exists
    ensureDirectoryExists(sketchDir);

    // Save code parts to files and collect filenames for non-HTML sketches
    const savedCodePartsFilenames = [];

    sketchInfo.codeParts.forEach((codeBlock, index) => {
        const name = codeBlock.title || `part_${index + 1}`;
        let codeFileName = path.basename(name);

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

    // Download assets from fileBase URL to sketch directory
    if (config.DOWNLOAD_ASSETS && sketchInfo.files) {
        const assetBaseUrl = sketchInfo.metadata?.fileBase;

        if (assetBaseUrl) {
            sketchInfo.files.forEach(async (file) => {
                const filename = file?.name;

                if (filename) {
                    let assetUrl;

                    try {
                        // Resolve the full URL for the asset
                        assetUrl = await resolveAssetUrl(assetBaseUrl, filename);
                        if (!assetUrl) {
                            console.error(`Could not resolve URL for ${filename}`);
                            return;
                        }

                        // Set the local file path to the sketch directory
                        const assetFilePath = path.join(sketchDir, filename);

                        // Download and save the asset
                        const response = await axios.get(assetUrl, { responseType: 'arraybuffer' });
                        fs.writeFileSync(assetFilePath, response.data);
                    } catch (error) {
                        console.error(`Error downloading asset from URL: ${assetUrl}`);
                    }
                } else {
                    console.warn("Warning: A file in 'sketchInfo.files' is missing a 'filename' property.");
                }
            });
        } else {
            console.error("Error: 'fileBase' URL is missing in sketch metadata.");
        }
    } else {
        console.error("Error: 'sketchInfo.files' is missing or empty.");
    }


    // Generate index.html if not in HTML mode
    if (!sketchInfo.htmlMode) {
        generateIndexHtml(sketchInfo.metadata, sketchInfo.codeParts, sketchDir);
    }

    // Create metadata directory
    const metadataDir = path.join(sketchDir, globals.META_DIR);
    ensureDirectoryExists(metadataDir);

    // Save metadata to a JSON file
    const metadataFilePath = path.join(metadataDir, 'metadata.json');
    fs.writeFileSync(metadataFilePath, JSON.stringify(sketchInfo.metadata, null, 2));

    // Download thumbnail if available
    if (sketchInfo.metadata.visualID) {
        const imageUrl = globals.THUMBNAIL_URL_TEMPLATE.replace('{visualID}', sketchInfo.metadata.visualID);
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
