const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

// Serve static files from the public directory
app.use(express.static('public'));

// New route to handle dynamic scraping with pagination
app.get("/scrape", (req, res) => {
  const { website, keyword, page = 1, limit = 10 } = req.query;

  console.log(`Scraping website: ${website}, keyword: ${keyword}, page: ${page}, limit: ${limit}`); // Log the incoming request

  if (!website || !keyword) {
    return res.status(400).json({ message: "Website URL and keyword are required" });
  }

  console.log(`Scraping website: ${website}, keyword: ${keyword}, page: ${page}, limit: ${limit}`); // Log the incoming request

  axios.get(website)
    .then(async (response) => {
      console.log("Website successfully fetched.");

      const html = response.data;
      const $ = cheerio.load(html);
      const links = [];

      $("a", html).each(function () {
        const url = $(this).attr("href");

        // Collect valid article links
        if (url && url.startsWith("http")) {
          links.push({
            title: $(this).text(),
            url,
            source: website,
          });
        }
      });

      console.log("Collected links:", links);

      // Calculate pagination
      const start = (parseInt(page) - 1) * parseInt(limit);
      const end = start + parseInt(limit);
      const paginatedLinks = links.slice(start, end);

      // Now, visit each link and check the content for the keyword
      const filteredArticles = [];
      for (let link of paginatedLinks) {
        try {
          const articleResponse = await axios.get(link.url);
          const articleHtml = articleResponse.data;
          const $$ = cheerio.load(articleHtml);

          // Search for the keyword in the article's content
          const articleText = $$('body').text().toLowerCase(); // Get all text within the body
          if (articleText.includes(keyword.toLowerCase())) {
            filteredArticles.push(link);
          }
        } catch (err) {
          console.error(`Error scraping the article at ${link.url}:`, err.message);
        }
      }

      res.json({
        page: parseInt(page),
        limit: parseInt(limit),
        total: links.length,
        articles: filteredArticles,
      });
    })
    .catch((err) => {
      console.error("Error scraping the website:", err.message); // Log the error
      res.status(500).json({ message: "Error scraping the website", error: err.message });
    });
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
