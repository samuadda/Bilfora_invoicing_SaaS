import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export async function getBrowser() {
    let executablePath = await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
    );

    if (process.env.NODE_ENV === "development") {
        // Attempt to use local Chrome in development
        if (process.platform === "win32") {
            executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
        } else if (process.platform === "darwin") {
            executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
        } else {
            // Linux fallback (or use puppeteer full if installed)
            executablePath = "/usr/bin/google-chrome";
        }
    }

    console.log("Puppeteer: NODE_ENV=", process.env.NODE_ENV);
    console.log("Puppeteer: Executable Path=", executablePath);

    return puppeteer.launch({
        args: process.env.NODE_ENV === "production" ? chromium.args : [],
        defaultViewport: { width: 1920, height: 1080 },
        executablePath,
        headless: true,
    });
}

export async function generatePdf(html: string) {
    const browser = await getBrowser();
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        await page.emulateMediaType("screen");

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "18mm",
                right: "16mm",
                bottom: "18mm",
                left: "16mm",
            },
        });

        return pdfBuffer;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
