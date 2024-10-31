// modules/scraper.js
const puppeteer = require('puppeteer');
const config = require('../config');
const { setTimeout } = require('node:timers/promises');
const { ensureDirectoryExists } = require('./utils');

/**
 * Scrapes the sketch IDs from the OpenProcessing search page.
 * @returns {Promise<Array<string>>} A Promise that resolves with an array of sketch IDs.
 */
const scrapeSketchIds = async () => {
    const browser = await puppeteer.launch({ headless: config.HEADLESS });
    const page = await browser.newPage();

    try {
        console.log(`Navigating to: ${config.SEARCH_URL}`);
        await page.goto(config.SEARCH_URL, { waitUntil: 'networkidle2' });
        await setTimeout(5000); 

        // Click 'Show More' button until all sketches are loaded
        let loadMore = true;
        while (loadMore) {
            loadMore = await page.evaluate((selector) => {
                const showMoreButton = document.querySelector(selector);
                if (showMoreButton && showMoreButton.classList.contains('show')) {
                    showMoreButton.click();
                    return true;
                }
                return false;
            }, config.SHOW_MORE_SELECTOR);

            if (loadMore) {
                console.log('Clicked "Show More" button, waiting for more sketches to load...');
                await setTimeout(3000); // Wait additional time for dynamic content
            } else {
                console.log('No more "Show More" button found, proceeding to scrape sketch IDs...');
            }
        }

        console.log('All sketches loaded, scraping sketch IDs...');
        const sketchIds = await page.evaluate(() => {
            const links = document.querySelectorAll('a[href^="/sketch/"]');
            const ids = [];
            links.forEach(link => {
                const href = link.getAttribute('href');
                const match = href.match(/\/sketch\/(\d+)/);
                if (match && match[1] && href !== '/sketch/create') {
                    ids.push(match[1]);
                }
            });
            return [...new Set(ids)]; // Return unique sketch IDs
        });

        // console.log(`Total sketches found: ${sketchIds.length}`);
        return sketchIds;
    } catch (error) {
        console.error('Error scraping sketch IDs:', error.message);
        return [];
    } finally {
        await browser.close();
        // console.log('Browser closed');
    }
};

module.exports = { scrapeSketchIds };
