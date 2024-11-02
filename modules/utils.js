// modules/utils.js
const fs = require('fs');
const path = require('path');
const sanitize = require('sanitize-filename');

/**
 * Ensures the specified directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to ensure exists.
 */
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    } else {
        // console.log(`Directory already exists: ${dirPath}`);
    }
};

/**
 * Sanitizes a filename by removing unwanted characters and trimming spaces.
 * @param {string} filename - The filename to sanitize.
 * @returns {string} The sanitized filename.
 */
const sanitizeFilename = (filename) => {
    return sanitize(filename).trim().replace(/\s+/g, '_');
};

/**
 * Resolve asset URL based on the file name and base URL.
 * @param {string} assetBaseUrl - The base URL for assets.
 * @param {string} filename - The name of the asset file.
 * @returns {string} The resolved asset URL.
 * @async
 */
const resolveAssetUrl = async (assetBaseUrl, filename) => {
    if (!assetBaseUrl) {
        console.error('Missing asset base URL');
        return '';
    } else if (!filename) {
        console.error('Missing asset filename');
        return '';
    }

    // If the asset is hosted on a different domain (e.g., AWS)
    if (assetBaseUrl.startsWith('http')) {
        // Ensure consistent slashes between assetBaseUrl and filename
        const cleanedAssetBaseUrl = assetBaseUrl.endsWith('/') ? assetBaseUrl.slice(0, -1) : assetBaseUrl;
        const cleanedFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    
        const resolvedUrl = `${cleanedAssetBaseUrl}/${cleanedFilename}`;
        return resolvedUrl;
    }
    
    // If the asset is hosted on OpenProcessing
    if (assetBaseUrl.startsWith('/')) {
        const baseOpenProcessingUrl = 'https://openprocessing.org';
    
        // Ensure consistent slashes between assetBaseUrl and filename
        const cleanedAssetBaseUrl = assetBaseUrl.endsWith('/') ? assetBaseUrl.slice(0, -1) : assetBaseUrl;
        const cleanedFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    
        const resolvedUrl = `${baseOpenProcessingUrl}${cleanedAssetBaseUrl}/${cleanedFilename}`;
        return resolvedUrl;
    }

    console.error(`Failed to resolve asset URL`);
    console.log(`Asset base URL: ${assetBaseUrl}`);
    console.log(`Asset filename: ${filename}`);
    return '';
}

module.exports = {
    ensureDirectoryExists,
    sanitizeFilename,
    resolveAssetUrl,
};
