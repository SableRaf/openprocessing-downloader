const axios = require('axios');
const config = require('../config');
const logger = require('./logger');

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
            isFork: false,
            author: '',
            title: '',
            codeParts: [],
            files: [],
            libraries: [],
            mode: '',
            parent: {
                sketchID: null,
                author: '',
                title: '',
            },
            metadata: {}
        };

        try {
            // Fetch metadata for the sketch
            const metadataResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}`);
            if (metadataResponse.status === 200 && metadataResponse.data) {
                sketchInfo.metadata = metadataResponse.data;
            } else {
                logger.logError(`Unexpected response format for metadata of sketch ${sketchId}`);
            }
        } catch (error) {
            logger.logError(`Error fetching metadata for sketch ${sketchId}:`, error);
        }

        sketchInfo.mode = sketchInfo.metadata.mode;
        sketchInfo.isFork = sketchInfo.metadata.parentID !== null;
        sketchInfo.parent.sketchID = sketchInfo.metadata.parentID;

        // fetch parent sketch info
        if (sketchInfo.isFork) {
            try {
                const parentMetadataResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchInfo.parent.sketchID}`);
                if (parentMetadataResponse.status === 200 && parentMetadataResponse.data) {
                    sketchInfo.parent.title = parentMetadataResponse.data.title;
                    sketchInfo.parent.author = await fetchUserInfo(parentMetadataResponse.data.userID).then(user => user.fullname);
                } else {
                    logger.logError(`Unexpected response format for metadata of parent sketch ${sketchInfo.parent.sketchID}`);
                }
            } catch (error) {
                logger.logError(`Error fetching metadata for parent sketch ${sketchInfo.parent.sketchID}:`, error);
            }
        }

        // Fetch the author of the sketch
        try {
            const userResponse = await axios.get(`https://openprocessing.org/api/user/${sketchInfo.metadata.userID}`);
            if (userResponse.status === 200 && userResponse.data) {
                sketchInfo.author = userResponse.data.fullname;
            } else {
                logger.logError(`Unexpected response format for user ${sketchInfo.metadata.userID}`);
            }
        } catch (error) {
            logger.logError(`Error fetching user ${sketchInfo.metadata.userID}:`, error);
        }

        // Fetch the sketch code
        try {
            const codeResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}/code`);
            if (codeResponse.status === 200 && Array.isArray(codeResponse.data)) {
                sketchInfo.codeParts = codeResponse.data;
            } else {
                logger.logError(`Unexpected response format for sketch code ${sketchId}`);
            }
        } catch (error) {
            logger.logError(`Error fetching sketch code ${sketchId}:`, error);
        }

        // Fetch the files associated with the sketch
        try {
            const filesResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}/files?limit=100&offset=0`);
            if (filesResponse.status === 200 && Array.isArray(filesResponse.data)) {
                sketchInfo.files = filesResponse.data;
            } else {
                logger.logError(`Unexpected response format for files`);
            }
        } catch (error) {
            logger.logError(`Error fetching files for sketch ${sketchId}`, error);
        }

        // Fetch the libraries associated with the sketch
        try {
            const librariesResponse = await axios.get(`https://openprocessing.org/api/sketch/${sketchId}/libraries?limit=100&offset=0`);
            if (librariesResponse.status === 200 && Array.isArray(librariesResponse.data)) {
                sketchInfo.libraries = librariesResponse.data;
            } else {
                logger.logError(`Unexpected response format for libraries`);
            }
        } catch (error) {
            logger.logError(`Error fetching libraries for sketch ${sketchId}`, error);
        }

        return sketchInfo;
    } catch (error) {
        logger.logError(`Error gathering information`, error);
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
                logger.logError(`Unexpected response format for curation ${curationId}`);
                return {};
            }
        })
        .catch(error => {
            logger.logError(`Error fetching curation ${curationId}`, error);
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
                logger.logError(`Unexpected response format for user ${userId}`);
                return {};
            }
        })
        .catch(error => {
            logger.logError(`Error fetching user ${userId}`, error);
            return {};
        });
}

module.exports = { fetchSketchInfo, fetchCurationInfo, fetchUserInfo };
