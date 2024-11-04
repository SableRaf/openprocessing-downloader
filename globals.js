// globals.js

const path = require('path');

module.exports = {
    SEARCH_URL_BASE: 'https://openprocessing.org/browse/?time=anytime&type=all&q=',
    USER_SKETCHES_URL_BASE: 'https://openprocessing.org/api/user/',
    CURATION_URL_BASE: 'https://openprocessing.org/api/curation/',
    SAVE_DIR: path.join(__dirname, 'downloads'),
    META_DIR: 'metadata',
    DEFAULT_DIR: path.join(__dirname, 'data/default'),
    DEFAULT_CSS: path.join(__dirname, 'data/default/style.css'),
    THUMBNAIL_URL_TEMPLATE: 'https://openprocessing-usercontent.s3.amazonaws.com/thumbnails/visualThumbnail{visualID}@2x.jpg',
    SHOW_MORE_SELECTOR: '#showMoreButton',
    HEADLESS: true,
    HIDDEN_CODE_MESSAGE: 'Sketch source code is hidden.',
};
