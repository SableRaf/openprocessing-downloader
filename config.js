// config.js

const Mode = {
    SEARCH_BY_TERM: 'SEARCH_BY_TERM',
    SEARCH_BY_USER_ID: 'SEARCH_BY_USER_ID',
    SEARCH_BY_CURATION_ID: 'SEARCH_BY_CURATION_ID',
};

module.exports = {
    SEARCH_MODE: Mode.SEARCH_BY_CURATION_ID, // Used to determine the search mode (search term, user, or curation)
    SEARCH_TERM: 'WCCChallenge', // Set to a specific search term (used if SEARCH_MODE is Mode.SEARCH_BY_TERM)
    USER_ID: '22192', // Set to a specific user ID (used if SEARCH_MODE is Mode.SEARCH_BY_USER_ID)
    CURATION_ID: '78544', // Set to a specific curation ID (used if SEARCH_MODE is Mode.SEARCH_BY_CURATION_ID)
    DOWNLOAD_ASSETS: true, // Set to true to download assets (images, sounds, etc.)
    VERBOSE: true, // Set to true to log additional information
    Mode, // Exporting Mode enum for other modules
};
