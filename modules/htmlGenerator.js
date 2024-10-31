const fs = require('fs');
const path = require('path');

const generateIndexHtml = (metadata, codeParts, outputDir) => {

    // Process the engine URL
    let engineURL = metadata.engineURL ? metadata.engineURL.replace(/\\/g, '') : '';

    // Check if the URL starts with "/" and prepend "https://openprocessing.org" if needed
    if (engineURL.startsWith('/')) {
        engineURL = `https://openprocessing.org${engineURL}`;
    }

    // Start HTML structure with OpenProcessing compatibility and p5.js engine URL
    const htmlHeadStart = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <!-- keep the line below for OpenProcessing compatibility -->
    <script src="https://openprocessing.org/openprocessing_sketch.js"></script>
    <script src="${engineURL}"></script>
`;



    // Add additional libraries from metadata if they exist
    const libraries = metadata.libraries
        .map(lib => `<script src="${lib.url}"></script>`)
        .join('\n    ');
    const librariesSection = libraries ? `    ${libraries}\n` : '';

    // Prepare script tags for all JavaScript code parts 
    const scriptTags = codeParts
        .filter(part => part.title && part.title.endsWith('.js'))
        .map(part => `<script src="${part.title}"></script>`)
        .join('\n    ');
    const scriptTagsSection = scriptTags ? `    ${scriptTags}\n` : '';

    // Prepare script tags for all code parts without a file extension (default to .js)
    const scriptTagsDefault = codeParts
        .filter(part => part.title && !part.title.includes('.'))
        .map(part => `<script src="${part.title}.js"></script>`)
        .join('\n    ');
    const scriptTagsDefaultSection = scriptTagsDefault ? `    ${scriptTagsDefault}\n` : '';

    // Prepare link tags for all CSS files
    const cssLinkTags = codeParts
        .filter(part => part.title && part.title.endsWith('.css'))
        .map(part => `<link rel="stylesheet" type="text/css" href="${part.title}">`)
        .join('\n    ');
    const cssLinkTagsSection = cssLinkTags ? `    ${cssLinkTags}\n` : '';

    // Combine all parts into the final HTML content
    const htmlContent = `${htmlHeadStart}${librariesSection}${scriptTagsSection}${scriptTagsDefaultSection}${cssLinkTagsSection}</head>

<body>

</body>

</html>`;

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the index.html to the output directory
    const outputPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf8');
};

module.exports = { generateIndexHtml };
