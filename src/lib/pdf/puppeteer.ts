import chromium from "@sparticuz/chromium-min";
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
        defaultViewport: { width: 1280, height: 720 },
    });
}

export async function generatePdf(html: string) {
    const browser = await getBrowser();
    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(30000);
        page.setDefaultNavigationTimeout(30000);

        // No external assets -> "load" is more reliable than networkidle0
        await page.setContent(html, { waitUntil: "load" });
        await page.emulateMediaType("screen");

        return await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "18mm", right: "16mm", bottom: "18mm", left: "16mm" },
            preferCSSPageSize: true,
        });
    } finally {
        await browser.close();
    }
}
