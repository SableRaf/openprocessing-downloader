const axios = require('axios');
const config = require('../config');
const logger = require('./logger');
const globals = require('../globals'); // Ensure the correct path

/**
 * Determines if the sketch code is hidden based on the API response.
 * @param {Object} responseData - The response data from the API.
 * @returns {boolean} True if the sketch code is hidden, otherwise false.
 */
function isSketchCodeHidden(responseData) {
    const HIDDEN_CODE_MESSAGE = globals.HIDDEN_CODE_MESSAGE; // Ensure this equals "Sketch source code is hidden."
    if (responseData && responseData.success === false) {
        const apiMessage = responseData.message;
        if (apiMessage === HIDDEN_CODE_MESSAGE) { // Use HIDDEN_CODE_MESSAGE variable
            return true;
        }
    }
    return false;
}

/**
 * Fetches data from the OpenProcessing API.
 * @param {string} url - The API endpoint URL.
 * @param {string} description - The description of the data being fetched.
 * @returns {Promise<Object>} The response data or an error object.
 */
async function fetchData(url, description) {
    try {
        const response = await axios.get(url, { validateStatus: () => true }); // Allow all status codes
        if (response.data) {
            if (response.data.success === false) {
                return { data: response.data, error: response.data.message };
            }
            return { data: response.data, error: null };
        } else {
            logger.logError(`Unexpected response format for ${description}`);
            return { data: null, error: `Unexpected response format for ${description}` };
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        logger.logError(`Error fetching ${description}: ${errorMsg}`);
        return { data: null, error: errorMsg };
    }
}

/**
 * Fetches the code response from the OpenProcessing API.
 * @param {number} sketchId - The ID of the sketch.
 * @returns {Promise<Object>} An object containing isHidden, codeParts, and error.
 */
async function fetchCodeResponse(sketchId) {
    const { data: responseData, error } = await fetchData(`https://openprocessing.org/api/sketch/${sketchId}/code`, `sketch code ${sketchId}`);
    
    // Because the API returns a 401 status code when the code is hidden
    // it's important that we check for hidden code before checking for errors
    const isHidden = isSketchCodeHidden(responseData);
    if (isHidden) {
        return { isHidden: true, codeParts: [], error: '' };
    }

    if (error) {
        return { isHidden: false, codeParts: [], error };
    }

    if (Array.isArray(responseData)) {
        return { isHidden: false, codeParts: responseData, error: '' };
    } else if (responseData && responseData.success === false) {
        const apiMessage = responseData.message;
        logger.logError(`The API responded with an error for sketch ${sketchId}: "${apiMessage}"`);
        return { isHidden: false, codeParts: [], error: apiMessage };
    } else {
        const errorMessage = `Unexpected response format for sketch code ${sketchId}`;
        logger.logError(errorMessage);
        return { isHidden: false, codeParts: [], error: errorMessage };
    }
}

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
            assets: [],
            libraries: [],
            mode: '',
            hiddenCode: false,
            error: '',
            parent: {
                sketchID: null,
                author: '',
                title: '',
            },
            metadata: {}
        };

        // Fetch metadata for the sketch
        const { data: metadata, error: metadataError } = await fetchData(`https://openprocessing.org/api/sketch/${sketchId}`, `metadata of sketch ${sketchId}`);
        if (metadataError) {
            sketchInfo.error = metadataError;
        } else {
            sketchInfo.metadata = metadata;
            sketchInfo.mode = metadata.mode || ''; // Default if mode is undefined
            sketchInfo.isFork = metadata.parentID != null && metadata.parentID !== 0 && metadata.parentID !== "0";
            sketchInfo.parent.sketchID = metadata.parentID || null;
        }

        // Fetch parent sketch info if it’s a fork
        if (sketchInfo.isFork && sketchInfo.parent.sketchID) {
            const { data: parentMetadata, error: parentMetadataError } = await fetchData(`https://openprocessing.org/api/sketch/${sketchInfo.parent.sketchID}`, `parent sketch ${sketchInfo.parent.sketchID}`);
            if (parentMetadataError) {
                sketchInfo.error = parentMetadataError;
            } else {
                sketchInfo.parent.title = parentMetadata.title || '';
                sketchInfo.parent.author = await fetchUserInfo(parentMetadata.userID).then(user => user.fullname || '');
            }
        }

        // Fetch the author of the sketch
        if (sketchInfo.metadata.userID) {
            const { data: user, error: userError } = await fetchData(`https://openprocessing.org/api/user/${sketchInfo.metadata.userID}`, `user ${sketchInfo.metadata.userID}`);
            if (userError) {
                sketchInfo.error = userError;
            } else {
                sketchInfo.author = user.fullname || '';
            }
        }

        // Fetch the sketch code and set codeParts accordingly
        const { isHidden, codeParts, error: codeError } = await fetchCodeResponse(sketchId);
        sketchInfo.hiddenCode = isHidden;
        sketchInfo.codeParts = codeParts;
        sketchInfo.error = codeError;

        // Fetch the assets associated with the sketch
        const { data: assets, error: assetsError } = await fetchData(`https://openprocessing.org/api/sketch/${sketchId}/files?limit=100&offset=0`, `assets for sketch ${sketchId}`);
        if (assetsError) {
            sketchInfo.error = assetsError;
        } else {
            sketchInfo.assets = assets;
        }

        // Fetch the libraries associated with the sketch
        const { data: libraries, error: librariesError } = await fetchData(`https://openprocessing.org/api/sketch/${sketchId}/libraries?limit=100&offset=0`, `libraries for sketch ${sketchId}`);
        if (librariesError) {
            sketchInfo.error = librariesError;
        } else {
            sketchInfo.libraries = libraries;
        }

        return sketchInfo;
    } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        logger.logError(`Error gathering information: ${errorMessage}`);
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
    return fetchData(`https://openprocessing.org/api/curation/${curationId}`, `curation ${curationId}`)
        .then(({ data, error }) => {
            if (error) {
                return {};
            }
            return data;
        });
}

/**
 * Gathers information for a user from the OpenProcessing API.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Object>} A Promise that resolves with the user information object.
 * @async
 */
function fetchUserInfo(userId) {
    return fetchData(`https://openprocessing.org/api/user/${userId}`, `user ${userId}`)
        .then(({ data, error }) => {
            if (error) {
                return {};
            }
            return data;
        });
}

module.exports = { fetchSketchInfo, fetchCurationInfo, fetchUserInfo, isSketchCodeHidden };