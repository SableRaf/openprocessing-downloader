// modules/sketchCollector.js
const axios = require('axios');
const puppeteer = require('puppeteer');
const { fetchUserInfo, fetchSketchInfo, fetchCurationInfo } = require('./metadataFetcher');

/**
 * Collect sketch IDs based on search term, user ID, or curation ID.
 * @param {Object} options - Configuration options.
 * @param {string} options.searchMode - Mode indicating whether to search by term, user ID, or curation ID.
 * @param {string} options.searchQuery - Search term.
 * @param {string} options.searchUrlBase - Base URL for search queries.
 * @param {string} options.userId - User ID for fetching sketches.
 * @param {string} options.userSketchesUrlBase - Base URL for fetching user sketches.
 * @param {string} options.curationId - Curation ID for fetching curated sketches.
 * @param {string} options.curationUrlBase - Base URL for fetching curated sketches.
 * @param {number} options.limit - Number of sketches to fetch per page.
 * @param {number} options.offset - Starting offset for pagination.
 * @param {boolean} options.headless - Headless mode for Puppeteer.
 * @returns {Promise<Array<string>>} - A promise that resolves with an array of sketch IDs.
 */
const collectSketchIds = async ({ searchMode, searchQuery, searchUrlBase, userId, userSketchesUrlBase, curationId, curationUrlBase, limit, offset, headless }) => {
    switch (searchMode) {
        case 'SEARCH_BY_USER_ID':
            return fetchSketchIdsByUserId(userId, userSketchesUrlBase);
        case 'SEARCH_BY_TERM':
            return fetchSketchIdsBySearch(searchQuery, searchUrlBase, headless);
        case 'SEARCH_BY_CURATION_ID':
            return fetchSketchIdsByCuration(curationId, curationUrlBase, limit, offset);
        default:
            console.error(`Invalid mode specified: ${searchMode}`);
            return [];
    }
};

// Fetches sketch IDs by user ID
const fetchSketchIdsByUserId = async (userId, userSketchesUrlBase) => {
    const userFullName = await fetchUserInfo(userId).then(user => user.fullname);
    console.log(`🔍 Listing sketches for user "${userFullName}" with ID: ${userId}`);
    try {
        const response = await axios.get(`${userSketchesUrlBase}${userId}/sketches`);
        return response.status === 200 && Array.isArray(response.data)
            ? response.data.map(sketch => sketch.visualID)
            : [];
    } catch (error) {
        console.error(`😬 Error fetching sketches for user ID ${userId}:`, error.message);
        return [];
    }
};

// Fetches sketch IDs by search term using Puppeteer
const fetchSketchIdsBySearch = async (searchQuery, searchUrlBase, headless) => {
    const searchUrl = `${searchUrlBase}${encodeURIComponent(searchQuery)}`;
    console.log(`🔍 Searching sketches matching the term: "${searchQuery}"`);

    const browser = await puppeteer.launch({ headless });
    const page = await browser.newPage();

    try {
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });
        const sketchIds = await page.evaluate(() => {
            const links = document.querySelectorAll('a[href^="/sketch/"]');
            return Array.from(links)
                .map(link => link.getAttribute('href').match(/\/sketch\/(\d+)/))
                .filter(Boolean)
                .map(match => match[1]);
        });
        return [...new Set(sketchIds)];
    } catch (error) {
        console.error('😬 Error fetching sketch IDs by search:', error.message);
        return [];
    } finally {
        await browser.close();
    }
};

// Fetches sketch IDs by curation ID with pagination
const fetchSketchIdsByCuration = async (curationId, curationUrlBase, limit, offset) => {
    const curationTitle = await fetchCurationInfo(curationId).then(curation => curation.title);
    console.log(`🔍 Listing sketches for curation: "${curationTitle}" with ID: ${curationId}`);
    try {
        const curationUrl = `${curationUrlBase}${curationId}/sketches`;        
        const response = await axios.get(curationUrl);
        if (response.status === 200 && Array.isArray(response.data)) {
            return response.data.map(sketch => sketch.visualID);
        } else {
            console.error(`😬 Unexpected response format for curation sketches for curation ID: ${curationId}`);
            return [];
        }
    } catch (error) {
        console.error(`😬 Error fetching sketches for curation ID ${curationId}:`, error.message);
        return [];
    }
};

module.exports = { collectSketchIds };
