const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

// Serve static files from the public directory
app.use(express.static("public"));

// New route to handle dynamic scraping with pagination
app.get("/scrape", async (req, res) => {
  const { website, keyword, page = 1, limit = 10 } = req.query;

  console.log(`Scraping website: ${website}, keyword: ${keyword}, page: ${page}, limit: ${limit}`);

  if (!website || !keyword) {
    return res.status(400).json({ message: "Website URL and keyword are required" });
  }

  try {
    // Retry mechanism for initial website fetch
    let response;
    const maxRetries = 3;
    let retries = 0;
    while (retries < maxRetries) {
      try {
        response = await axios.get(website, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          },
          timeout: 10000,
        });
        break;
      } catch (err) {
        retries++;
        if (retries === maxRetries) throw new Error(`Failed to fetch ${website}: ${err.message}`);
        console.log(`Retrying (${retries}/${maxRetries}) for ${website}...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log("Website successfully fetched.");

    const html = response.data;
    const $ = cheerio.load(html);
    const links = [];

    // Collect potential article links with relaxed heuristic filtering
    $("a", html).each(function () {
      const url = $(this).attr("href");
      const text = $(this).text().trim();
      const parentClasses = $(this).parent().attr("class") || "";
      const hrefLower = url ? url.toLowerCase() : "";

      // Heuristic checks for article-like links
      if (
        url &&
        url.startsWith("http") && // Must be an absolute URL
        text.length > 5 && // Relaxed to capture shorter titles
        !parentClasses.match(/(footer|nav|header|menu|sidebar)/i) && // Avoid common non-article containers
        !hrefLower.includes("/signup") &&
        !hrefLower.includes("/login") &&
        !hrefLower.includes("/terms") &&
        !hrefLower.includes("/privacy") &&
        !hrefLower.includes("/ads") &&
        !hrefLower.includes("/advertise") &&
        !hrefLower.includes("/subscribe") &&
        !hrefLower.includes("/account") &&
        !hrefLower.includes("/profile") &&
        !hrefLower.includes("/shop") &&
        !hrefLower.includes("/cart") &&
        !hrefLower.includes(".pdf") &&
        !hrefLower.includes("/cookie") &&
        !hrefLower.includes("/sitemap") &&
        !hrefLower.includes("/contact") &&
        !hrefLower.includes("/about") &&
        !hrefLower.includes("javascript:") && // Avoid JavaScript links
        !hrefLower.includes("#") // Avoid anchor links
      ) {
        links.push({
          title: text || "No title",
          url,
          source: website,
        });
      } else {
        console.log(`Skipped link: ${url} (text: "${text}", parent: ${parentClasses})`);
      }
    });

    console.log(`Collected ${links.length} links:`, links.map(link => link.url));

    // Calculate pagination
    const start = (parseInt(page) - 1) * parseInt(limit);
    const end = start + parseInt(limit);
    const paginatedLinks = links.slice(start, end);

    // Visit each link and check for the keyword
    const filteredArticles = [];
    for (let link of paginatedLinks) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
        let articleResponse;
        retries = 0;
        while (retries < maxRetries) {
          try {
            articleResponse = await axios.get(link.url, {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              },
              timeout: 10000,
            });
            // Check if response is HTML
            if (articleResponse.headers["content-type"]?.includes("text/html")) {
              break;
            } else {
              throw new Error("Non-HTML content");
            }
          } catch (err) {
            retries++;
            if (retries === maxRetries) throw new Error(`Failed to fetch ${link.url}: ${err.message}`);
            console.log(`Retrying (${retries}/${maxRetries}) for ${link.url}...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        const articleHtml = articleResponse.data;
        const $$ = cheerio.load(articleHtml);
        // Search within article-like containers for better accuracy
        const articleText = $$("article, main, div[class*='article'], div[class*='content'], div[class*='story'], p, h1, h2, h3")
          .text()
          .toLowerCase();

        if (articleText.includes(keyword.toLowerCase())) {
          filteredArticles.push(link);
          console.log(`Article matched keyword "${keyword}": ${link.url}`);
        } else {
          console.log(`Article did not match keyword "${keyword}": ${link.url}`);
        }
      } catch (err) {
        console.error(`Error scraping article at ${link.url}: ${err.message}`);
      }
    }

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total: links.length,
      articles: filteredArticles,
    });
  } catch (err) {
    console.error(`Error scraping the website ${website}: ${err.message}`);
    res.status(500).json({ message: "Error scraping the website", error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));