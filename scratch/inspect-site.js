const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });
  const page = await context.newPage();

  // Listen to console logs
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  // Listen to failed requests
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
  });

  page.on('response', response => {
    console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
  });

  console.log("Navigating to http://localhost:8080/ ...");
  try {
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  } catch (err) {
    console.error("Navigation failed:", err.message);
  }

  // Check if stylesheet is loaded
  const hasStyleSheet = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    return links.map(link => ({
      href: link.href,
      sheetLoaded: !!link.sheet,
      rulesCount: link.sheet ? link.sheet.cssRules.length : 0
    }));
  });
  console.log("Stylesheet elements found:", JSON.stringify(hasStyleSheet, null, 2));

  // Get computed styles of body
  const bodyStyles = await page.evaluate(() => {
    const el = document.body;
    const computed = window.getComputedStyle(el);
    return {
      backgroundColor: computed.backgroundColor,
      color: computed.color,
      fontFamily: computed.fontFamily,
      padding: computed.padding
    };
  });
  console.log("Body computed styles:", JSON.stringify(bodyStyles, null, 2));

  // Get computed styles of hero-section
  const heroStyles = await page.evaluate(() => {
    const el = document.querySelector('.hero-section');
    if (!el) return null;
    const computed = window.getComputedStyle(el);
    return {
      display: computed.display,
      gridTemplateColumns: computed.gridTemplateColumns,
      border: computed.border,
      padding: computed.padding
    };
  });
  console.log("Hero Section computed styles:", JSON.stringify(heroStyles, null, 2));

  // Take a screenshot
  const screenshotPath = '/Users/varundua/.gemini/antigravity-cli/brain/ea5310d0-c6df-4846-b837-85f22466690e/local_site_screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved to ${screenshotPath}`);

  await browser.close();
  console.log("Done!");
})();
