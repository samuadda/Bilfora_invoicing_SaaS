const fs = require('fs');
const https = require('https');
const path = require('path');

if (!fs.existsSync('public/fonts')) {
    fs.mkdirSync('public/fonts', { recursive: true });
}

const fonts = [
    { url: 'https://github.com/google/fonts/raw/main/ofl/cairo/Cairo-Regular.ttf', dest: 'public/fonts/Cairo-Regular.ttf' },
    { url: 'https://github.com/google/fonts/raw/main/ofl/cairo/Cairo-Bold.ttf', dest: 'public/fonts/Cairo-Bold.ttf' }
];

function download(url, dest) {
    const file = fs.createWriteStream(path.join(__dirname, dest));
    const request = https.get(url, function (response) {
        if (response.statusCode === 302 || response.statusCode === 301) {
            download(response.headers.location, dest);
            return;
        }
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${dest}`);
        });
    }).on('error', (err) => {
        fs.unlink(dest, () => { }); // Delete the file async. (But we don't check the result)
        console.error(`Error downloading ${dest}:`, err.message);
    });
}

fonts.forEach(font => download(font.url, font.dest));
