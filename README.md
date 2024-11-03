# OpenProcessing Downloader

A Node.js tool to back up OpenProcessing sketches to your local machine. Download code, assets, and metadata for all public sketches in a collection, all sketches by a specific user, or even a specific sketch using its ID.

## Installation

1. **Clone the repository**

2. **Install dependencies**:

   ```bash
   npm install
   ```

## Usage

1. **Configure the parameters** in `config.js`:
   - `SEARCH_MODE`: Choose a search mode from:
     - `SEARCH_BY_TERM`: Download sketches matching a specific search term.
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

### Command line arguments

You can also pass arguments via command line:

1. **Search by Term**:
   ```bash
   node main.js --term "nature"
   ```
   This sets `SEARCH_MODE` to `SEARCH_BY_TERM` and uses `"nature"` as the search term.

2. **Search by User ID**:
   ```bash
   node main.js --user 12345
   ```
   This sets `SEARCH_MODE` to `SEARCH_BY_USER_ID` and uses `12345` as the user ID.

3. **Enable Verbose Mode**:
   ```bash
   node main.js --verbose
   ```
   This sets `VERBOSE` to `true`.

4. **Download Assets and Skip Forks**:
   ```bash
   node main.js --downloadAssets --skipForks
   ```
   This sets both `DOWNLOAD_ASSETS` and `SKIP_FORKS` to `true`.

## Limitations

- Private sketches can not be accessed via the API.

## Acknowledgements

This script is possible thanks to the [OpenProcessing API](https://openprocessing.org/api). Thanks to [Sinan Ascioglu](https://www.wiredpieces.com/) for creating OpenProcessing and its API.

## License

This project is licensed under the **GNU General Public License v2.0 or later**.