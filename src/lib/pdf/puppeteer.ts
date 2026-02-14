import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import fs from "node:fs";

export async function getBrowser() {
    const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

    let executablePath: string | undefined;

    if (isProd) {
        executablePath = await chromium.executablePath();
    } else {
        // Dev: try common Chrome paths, but only if they exist
        const candidates =
            process.platform === "win32"
                ? ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"]
                : process.platform === "darwin"
                    ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
                    : ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"];

        executablePath = candidates.find((p) => fs.existsSync(p));
        // If undefined, puppeteer will try defaults / will error clearly
    }

    return puppeteer.launch({
        args: isProd ? chromium.args : ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath,
        headless: true,
        // A4 at 96 DPI: 210mm = 794px, 297mm = 1123px
        defaultViewport: { width: 794, height: 1123 },
    });
}

export async function generatePdf(html: string) {
    const browser = await getBrowser();
    try {
        const page = await browser.newPage();
        
        // Set timeout for operations
        page.setDefaultTimeout(30000);
        page.setDefaultNavigationTimeout(30000);

        // Load the HTML content
        await page.setContent(html, { waitUntil: "load" });
        
        // Emulate screen media type to match browser preview
        await page.emulateMediaType("screen");
        
        // Wait for fonts to be fully loaded before rendering
        await page.evaluate(() => document.fonts.ready);
        
        // Small delay to ensure all styles are applied
        await new Promise(resolve => setTimeout(resolve, 100));

        return await page.pdf({
            format: "A4",
            printBackground: true,
            // Zero margins - let HTML control all spacing
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
            preferCSSPageSize: true,
        });
    } finally {
        await browser.close();
    }
}

