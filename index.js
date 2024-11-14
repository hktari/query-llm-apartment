/* This example demonstrates how to run the script in a headless browser. */

const { wrap, configure } = require("agentql");
const { chromium } = require("playwright");
const dotenv = require("dotenv");
dotenv.config();

// Define the URL of the page to scrape.
const URL = "https://www.bolha.com/oddaja-stanovanja";

// Define the queries to locate the search box and fetch the stock number.
const SEARCH_QUERY = `
{
  apartments[] {
    name
    description
    areaMetersSquared
    availabilityDate
    monthlyPriceEuros
    utilityCostsEuros
    securityDepositEuros
    location {
      address
      city
    }
    imageUrl
    linkToListing
    contactTelephone
    postedOnDate
  }
}
`;

(async () => {
  // Configure the AgentQL API key
  configure({
    apiKey: process.env.AGENTQL_API_KEY, // This is the default and can be omitted.
  });

  // Launch a headless browser using Playwright.
  const browser = await chromium.launch({ headless: false });
  // Create a new page in the browser and wrap it to get access to the AgentQL's querying API
  const page = await wrap(await browser.newPage());
  await page.goto(URL);

  const closeCookieNoticeButton = await page.waitForSelector("#didomi-notice-agree-button", {
    timeout: 2000,
  });

  if (closeCookieNoticeButton) {
    await closeCookieNoticeButton.click();
  }

  // Use queryElements() method to locate the search box from the page.
  console.log("querying...");
  const searchResponse = await page.queryElements(SEARCH_QUERY);

  console.log("done");
  await browser.close();

  const fs = require("fs");
  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync(
    "output/apartments.json",
    JSON.stringify(searchResponse, null, 2)
  );

  console.log("Apartments data has been saved to apartments.json file.");
})();
