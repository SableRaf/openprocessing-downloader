// modules/listSketchIDs.js

const axios = require('axios');
const puppeteer = require('puppeteer');

const globals = require('../globals');
const config = require('../config');
const { fetchUserInfo, fetchSketchInfo, fetchCurationInfo } = require('./fetchMetadata');

/**
 * Collect sketch IDs based on search term, user ID, or curation ID.
 * @returns {Promise<Array<string>>} - A promise that resolves with an array of sketch IDs.
 */
const collectSketchIds = async () => {
    switch (config.SEARCH_MODE) {
        case 'SEARCH_BY_USER_ID':
            return fetchSketchIdsByUserId(config.USER_ID, globals.USER_SKETCHES_URL_BASE);
        case 'SEARCH_BY_TERM':
            return fetchSketchIdsBySearch(config.SEARCH_QUERY, globals.SEARCH_URL_BASE, globals.HEADLESS);
        case 'SEARCH_BY_CURATION_ID':
            return fetchSketchIdsByCuration(config.CURATION_ID, globals.CURATION_URL_BASE);
        default:
            console.error(`Invalid mode specified: ${config.SEARCH_MODE}`);
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
