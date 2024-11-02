// modules/sketchInfoFetcher.js
const axios = require('axios');
const config = require('../config');

/**
 * Gathers information for a sketch from the OpenProcessing API.
 * @param {number} sketchId - The ID of the sketch.
 * @returns {Promise<Object>} A Promise that resolves with the sketch information object.
 * @async
 */
const fetchSketchInfo = async (sketchId) => {
    try {
        const sketchInfo = {
            sketchId,
            codeParts: [],
            files: [],
            libraries: [],
            mode: '',
            metadata: {}
        };

        // Fetch metadata for the sketch
        const metadataResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}`);
        if (metadataResponse.status === 200 && metadataResponse.data) {
            sketchInfo.metadata = metadataResponse.data;
        } else {
            console.error(`Unexpected response format for metadata of sketch ${sketchId}`);
        }

        // Determine the mode of the sketch
        sketchInfo.mode = sketchInfo.metadata.mode;

        // Emoji based on mode (processingjs, html, p5js, or applet)
        const modeEmoji = { processingjs: '🅿️', html: '🗂️', p5js: '🌸', applet: '📦' }[sketchInfo.mode] || '❓';

        if (sketchInfo.metadata.title === undefined) {
            console.log(`No title found.`);
        } else {
            console.log('-------------------------------------------------------------');
            console.log(`${modeEmoji} "${sketchInfo.metadata.title}" (ID: ${sketchId})`);
        }

        // Fetch the sketch code
        const codeResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}/code`);
        if (codeResponse.status === 200 && Array.isArray(codeResponse.data)) {
            sketchInfo.codeParts = codeResponse.data;
            // Determine if the sketch is in HTML mode
            sketchInfo.htmlMode = sketchInfo.metadata.mode === 'html';
        } else {
            console.error(`Unexpected response format for sketch code ${sketchId}`);
        }

        if (config.VERBOSE === true) {
            console.log(`   📁Files (${sketchInfo.codeParts.length}):`);
            sketchInfo.codeParts.forEach(part => {
                console.log(`      📄${part.title}`);
            });
        }

        // Fetch the files associated with the sketch
        try {
            const filesResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}/files?limit=100&offset=0`);
            if (filesResponse.status === 200 && Array.isArray(filesResponse.data)) {
                sketchInfo.files = filesResponse.data;
                if (config.VERBOSE) {
                    console.log(`   📁Assets (${sketchInfo.files.length}):`);
                    sketchInfo.files.forEach(file => {
                        console.log(`      📄${file.name}`);
                    });
                }
            } else {
                console.error(`Unexpected response format for files`);
            }
        } catch (error) {
            console.error(`Error fetching files for sketch ${sketchId}:`, error);
        }

        // Fetch the libraries associated with the sketch
        try {
            const librariesResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}/libraries?limit=100&offset=0`);
            if (librariesResponse.status === 200 && Array.isArray(librariesResponse.data)) {
                sketchInfo.libraries = librariesResponse.data;
                if (config.VERBOSE) {
                    console.log(`   📚Libraries (${sketchInfo.libraries.length}):`);
                    sketchInfo.libraries.forEach(library => {
                        console.log(`      🔗 ${library.url}`);
                    });
                }
            } else {
                console.error(`Unexpected response format for libraries`);
            }
        } catch (error) {
            console.error(`Error fetching libraries for sketch ${sketchId}:`, error);
        }


        return sketchInfo;
    } catch (error) {
        console.error(`Error gathering information:`, error.message);
        return null;
    }
};

/**
 * Gathers information for a curation from the OpenProcessing API.
 * @param {number} curationId - The ID of the curation.
 * @returns {Promise<Object>} A Promise that resolves with the curation information object.
 * @async
 */
function fetchCurationInfo(curationId) {
    return axios.get(`https://openprocessing.org/api/curation/${curationId}`)
        .then(response => {
            if (response.status === 200 && response.data) {
                return response.data;
            } else {
                console.error(`Unexpected response format for curation ${curationId}`);
                return {};
            }
        })
        .catch(error => {
            console.error(`Error fetching curation ${curationId}:`, error.message);
            return {};
        });
}

/**
 * Gathers information for a user from the OpenProcessing API.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Object>} A Promise that resolves with the user information object.
 * @async
 */
function fetchUserInfo(userId) {
    return axios.get(`https://openprocessing.org/api/user/${userId}`)
        .then(response => {
            if (response.status === 200 && response.data) {
                return response.data;
            } else {
                console.error(`Unexpected response format for user ${userId}`);
                return {};
            }
        })
        .catch(error => {
            console.error(`Error fetching user ${userId}:`, error.message);
            return {};
        });
}

module.exports = { fetchSketchInfo, fetchCurationInfo, fetchUserInfo };
