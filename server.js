const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// CACHE: We store the price here so we don't spam the target website
let cachedPrice = 151000; // Default fallback
let lastUpdated = 0;

// The function that goes out and finds the price
async function fetchStreetPrice() {
    try {
        // TARGET: We are scraping a site that tracks parallel rates. 
        // Example: alanchand.com often tracks regional street rates including IQD.
        const url = 'https://alanchand.com/en/exchange-rates/usd-iqd';
        
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // INSPECT ELEMENT: This is the "CSS Selector" where the price lives.
        // On alanchand, the big price is usually in a specific headers tag.
        // We look for the text "1,xxx"
        // Note: You might need to adjust this '.rates-main-val' if the site changes.
        let priceText = $('div.rates-main-val').first().text(); 
        
        // Clean the text: remove commas, spaces, letters
        let cleanPrice = priceText.replace(/[^0-9.]/g, ''); 
        
        let price = parseFloat(cleanPrice);

        // LOGIC CHECK: The site might show "1,510" (price for $1) or "151,000" (price for $100)
        // If it's small (like 1510), multiply by 100 to get the standard Iraqi format
        if (price < 10000) {
            price = price * 100;
        }

        if (price > 100000 && price < 200000) {
            console.log(`Updated price from web: ${price}`);
            return price;
        } else {
            throw new Error('Price looks suspicious/wrong');
        }

    } catch (error) {
        console.error("Scraping failed, using old price:", error.message);
        return cachedPrice; // Return old price if scraping fails
    }
}

// The API Endpoint your website will call
app.get('/api/rate', async (req, res) => {
    // Only scrape if our data is older than 10 minutes (600000ms)
    // This prevents getting banned by the target site
    const now = Date.now();
    if (now - lastUpdated > 600000) {
        const newPrice = await fetchStreetPrice();
        if (newPrice) {
            cachedPrice = newPrice;
            lastUpdated = now;
        }
    }

    res.json({
        rate: cachedPrice,
        updatedAt: new Date(lastUpdated).toISOString(),
        source: "Market"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));