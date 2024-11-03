// modules/logger.js

const config = require('../config');

/**
 * Logs metadata information about a sketch.
 * @param {Object} sketchInfo - The sketch information object.
 */
function logSketchInfo(sketchInfo) {
    const modeEmoji = { processingjs: '🅿️', html: '🗂️', p5js: '🌸', applet: '📦' }[sketchInfo.mode] || '❓';
    console.log(`${modeEmoji} "${sketchInfo.metadata.title || 'Untitled'}" (ID: ${sketchInfo.sketchId})`);
    console.log(`🥚 by ${sketchInfo.author}`);
    console.log(`🔗 https://openprocessing.org/sketch/${sketchInfo.sketchId}`);
}

/**
 * Logs details about code parts of a sketch.
 * @param {Array} codeParts - Array of code parts in the sketch.
 */
function logCodeParts(codeParts) {
    console.log(`📁Files (${codeParts.length}):`);
    codeParts.forEach(part => {
        console.log(`   📄${part.title}`);
    });
}

/**
 * Logs details about assets associated with a sketch.
 * @param {Array} files - Array of files associated with the sketch.
 */
function logAssets(files) {
    console.log(`📁Assets (${files.length}):`);
    files.forEach(file => {
        console.log(`   📄${file.name}`);
    });
    if (files.length > 0 && config.DOWNLOAD_ASSETS == false && config.VERBOSE) { 
        console.warn(`Asset downloading is disabled. Set DOWNLOAD_ASSETS to true in config.js to enable.`); 
    }
}

/**
 * Logs details about libraries associated with a sketch.
 * @param {Array} libraries - Array of libraries used in the sketch.
 */
function logLibraries(libraries) {
    console.log(`📚Libraries (${libraries.length}):`);
    libraries.forEach(library => {
        console.log(`   🔗 ${library.url}`);
    });
}

/**
 * Log fork status and link to forked sketch.
 */
function logParentInfo(parent) {
    console.log(`🍴 Fork of "${parent.title}" (ID: ${parent.sketchID}) by ${parent.author}`);
    console.log(`🔗 https://openprocessing.org/sketch/${parent.sketchID}`);
}

/**
 * Log a regular message.
 * @param {string} message - Message to log.
 */
function logMessage(message) {
    console.log(message);
}

/**
 * Logs n number of empty lines.
 * @param {number} length - Number of characters to log.
 */
function lineBreak(length = 1) {
    for (let i = 0; i < length; i++) {
        console.log();
    }
}

/**
 * Logs a separator line.
 * @param {string} char - Character to repeat.
 * @param {number} length - Number of characters to log.
 */
function logSeparator(length = 60, char = '-',) {
    console.log(char.repeat(length));
}

/**
 * Logs an error message with context.
 * @param {string} message - Error message to log.
 * @param {Error} error - Error object.
 */
function logError(message, error) {
    console.error(`${message}:`, error.message);
}

module.exports = {
    logSketchInfo,
    logCodeParts,
    logAssets,
    logLibraries,
    logParentInfo,
    logMessage,
    lineBreak,
    logSeparator,
    logError
};
