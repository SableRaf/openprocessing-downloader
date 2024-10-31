// config.js
const path = require('path');

const SEARCH_QUERY = 'WCCChallenge';

module.exports = {
    SEARCH_URL: `https://openprocessing.org/browse/?time=anytime&type=all&q=${encodeURIComponent(SEARCH_QUERY)}`,
    SAVE_DIR: path.join(__dirname, 'downloads'),
    META_DIR: 'metadata',
    DEFAULT_DIR: path.join(__dirname, 'data/default'),
    DEFAULT_HTML: path.join(__dirname, 'data/default/index.html'),
    DEFAULT_CSS: path.join(__dirname, 'data/default/style.css'),
    THUMBNAIL_URL_TEMPLATE: 'https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail{visualID}@2x.jpg',
    SHOW_MORE_SELECTOR: '#showMoreButton',
    HEADLESS: true, // Set to false if you want to see the browser actions
};
