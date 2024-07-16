import puppeteer, { Browser, Page } from "puppeteer";
import retry from "async-retry";

const RETRY_OPTIONS_SAME_BROWSER = {
  retries: 3,
  minTimeout: 1000,
  factor: 2,
};
const MAX_RETRIES_NEW_BROWSER = 2;

let browser: Browser | null = null;

export async function getBrowserInstance() {
  if (browser && browser.isConnected()) {
      return browser;
  }

  browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
    protocolTimeout: 30000,
  });

  return browser;
}

export async function svgToPng(svg: string, retriesLeft = MAX_RETRIES_NEW_BROWSER): Promise<Buffer> {
  if (retriesLeft <= 0) {
    throw new Error('All retries for SVG to PNG conversion failed.');
  }

  let browser: Browser = await getBrowserInstance();
  let page: Page | null = null;

  try {
    return await retry(async () => {

      try {
        page = await browser.newPage();
        await page.setViewport({ width: 720, height: 720 }); // sets the viewport to be a square
        await page.goto(`data:image/svg+xml,${encodeURIComponent(svg)}`);

        const screenshot = await page.screenshot({
          omitBackground: true,
          fullPage: true,
        });        

        return screenshot as Buffer;

      } catch (error) {
        console.error('Error while converting SVG to PNG:', error);
        // re-throw the error after logging it
        throw error;
      } finally {
        if (page) {
          // ensure the page is always closed, even if an error occurs
          await page.close();
        }
      }
    }, RETRY_OPTIONS_SAME_BROWSER);
  } catch (error) {
    console.error('All retries failed, relaunching the browser:', error);
    // Close the browser and start a new one

    await browser.close();
    browser = await getBrowserInstance();

    // Try the conversion again with the new browser and one less retry
    return svgToPng(svg, retriesLeft - 1);
  }
}