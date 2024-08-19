const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

// Define the keyword to filter articles by URL
const keyword = ""; // Change this to your desired keyword

const newspapers = [
  {
    name: "yellowsystems",
    address: "https://yellow.systems/blog/web-development-future-trends",
    base: "",
  }
  // Additional newspapers can be added here
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $("a", html).each(function () {
      const url = $(this).attr("href");

      // Only include articles where the URL contains the keyword
      if (url && url.startsWith("https") && url.includes(keyword)) {
        const title = $(this).text();
        articles.push({
          title,
          url: newspaper.base + url,
          source: newspaper.name,
        });
      }
    });
  }).catch((err) => console.log(err));
});

app.get("/", (req, res) => {
  res.json("Welcome to my Tech Trends API");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newspaperID", (req, res) => {
  const newspaperID = req.params.newspaperID;

  const newspaper = newspapers.find(newspaper => newspaper.name === newspaperID);
  if (newspaper) {
    axios
      .get(newspaper.address)
      .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);
        const specificArticles = [];

        $("a", html).each(function () {
          const url = $(this).attr("href");

          // Only include articles where the URL contains the keyword
          if (url && url.startsWith("https") && url.includes(keyword)) {
            const title = $(this).text();
            specificArticles.push({
              title,
              url: newspaper.base + url,
              source: newspaperID,
            });
          }
        });
        res.json(specificArticles);
      })
      .catch((err) => console.log(err));
  } else {
    res.status(404).json({ message: "Newspaper not found" });
  }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
