# OpenProcessing Downloader

A Node.js tool to scrape and download sketches from OpenProcessing based on a search term.

## Installation

1. **Clone the repository**

2. **Install dependencies**:

   ```bash
   npm install
   ```

## Usage

1. **Set the parameters** in `config.js`:

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