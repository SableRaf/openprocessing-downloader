// modules/fetcher.js
const axios = require('axios');

/**
 * Gathers information for a sketch from the OpenProcessing API.
 * @param {number} sketchId - The ID of the sketch.
 * @returns {Promise<Object>} A Promise that resolves with the sketch information object.
 * @async
 */
const gatherSketchInfo = async (sketchId) => {
    try {
        const sketchInfo = {
            sketchId,
            codeParts: [],
            files: [],
            libraries: [],
            metadata: {}
        };

        // Fetch metadata for the sketch
        const metadataResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}`);
        if (metadataResponse.status === 200 && metadataResponse.data) {
            sketchInfo.metadata = metadataResponse.data;
        } else {
            console.error(`Unexpected response format for metadata of sketch ${sketchId}`);
        }
        
        if (sketchInfo.metadata.title === undefined) {
            console.log(`No title found.`);
        } else {
            console.log(`Title: "${sketchInfo.metadata.title}"`);
        }

        // if (sketchInfo.metadata.description === undefined || sketchInfo.metadata.description === null || sketchInfo.metadata.description === '') {
        // } else {
        //     console.log(`Description: ${sketchInfo.metadata.description}`);
        // }

        // Fetch the sketch code
        const codeResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}/code`);
        if (codeResponse.status === 200 && Array.isArray(codeResponse.data)) {
            sketchInfo.codeParts = codeResponse.data;
            // Determine if the sketch is in HTML mode
            sketchInfo.htmlMode = sketchInfo.metadata.mode === 'html';
        } else {
            console.error(`Unexpected response format for sketch code ${sketchId}`);
        }

        // Log the number and names of sketch code files found
        console.log(`Files (${sketchInfo.codeParts.length}):`);
        // console log files title and code
        sketchInfo.codeParts.forEach(part => {
            console.log(`    ${part.title}`);
        });

        // Fetch the files associated with the sketch
        const filesResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}/files?limit=100&offset=0`);
        if (filesResponse.status === 200 && Array.isArray(filesResponse.data)) {
            sketchInfo.files = filesResponse.data;
        } else {
            console.error(`Unexpected response format for files`);
        }

        // Fetch the libraries associated with the sketch
        const librariesResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}/libraries?limit=100&offset=0`);
        if (librariesResponse.status === 200 && Array.isArray(librariesResponse.data)) {
            sketchInfo.libraries = librariesResponse.data;
        } else {
            console.error(`Unexpected response format for libraries`);
        }

        return sketchInfo;
    } catch (error) {
        console.error(`Error gathering information:`, error.message);
        return null;
    }
};

module.exports = { gatherSketchInfo };
