# OpenProcessing Downloader

A Node.js tool to scrape and download sketches from OpenProcessing based on a search term.

## Installation

1. **Clone the repository**

2. **Install dependencies**:

   ```bash
   npm install
   ```

## Usage

1. **Configure the parameters** in `config.js`:
   - `SEARCH_MODE`: Choose a search mode from:
     - `SEARCH_BY_TERM`: Download sketches by a specific search term.
     - `SEARCH_BY_USER_ID`: Download sketches created by a specific user.
     - `SEARCH_BY_CURATION_ID`: Download sketches within a specific curated collection.
     - `SEARCH_BY_SKETCH_ID`: Download a specific sketch by ID.
   - `SEARCH_TERM`: Specify the search term if using `SEARCH_BY_TERM`. Note: It should be at least 4 characters long.
   - `USER_ID`: Specify the user ID if using `SEARCH_BY_USER_ID`.
   - `CURATION_ID`: Specify the curation ID if using `SEARCH_BY_CURATION_ID`.
   - `SKETCH_ID`: Specify the sketch ID if using `SEARCH_BY_SKETCH_ID`.
   - `DOWNLOAD_ASSETS`: Set to `true` to download sketch assets (like images and sounds).
   - `SKIP_FORKS`: Set to `true` to skip forks of sketches.
   - `VERBOSE`: Set to `true` to enable detailed logging during the process.

2. **Run the script**:

   ```bash
   node main.js
   ```

   This will:
   - List the sketch IDs matching the parameters in `config.js`.
   - Download each sketch’s metadata, code, and assets.
   - Save everything to the `downloads/` folder.

## License

This project is licensed under the **GNU General Public License v2.0 or later**.