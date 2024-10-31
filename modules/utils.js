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

module.exports = {
    ensureDirectoryExists,
    sanitizeFilename,
};
