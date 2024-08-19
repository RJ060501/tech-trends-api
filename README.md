# tech-trends-api

Project Overview
Project Name: Tech Trend API

Description: The Tech Trend API is a Node.js-based application designed to scrape news articles from specified websites and filter them based on user-provided keywords. The API allows users to dynamically fetch and display articles related to technology trends from various sources.

Core Components
Backend (index.js):

Framework: Express.js
Libraries:
axios for making HTTP requests.
cheerio for parsing and extracting data from HTML.
Functionality:
Dynamic Scraping: Allows users to specify any website URL and keyword through API endpoints.
Scraping Logic: Fetches webpage content, parses it for links, and checks if articles contain the specified keywords.
Endpoints:
GET /: A welcome message.
GET /news: Returns a list of scraped articles (though currently, this might need additional implementation to be functional).
GET /news/:newspaperID: Scrapes and returns articles from a specific newspaper.
Frontend:

HTML: Provides a user interface for entering website URLs and keywords.
JavaScript (script.js):
Form Handling: Allows users to submit website URLs and keywords to fetch news.
AJAX Requests: Sends requests to the API and displays results.
Functionality:
Dynamic Fetching: Users can fetch articles based on their input.
Error Handling: Displays errors if the API encounters issues.
Improvements Considered
Keyword Matching: The current scraper looks for keywords within the links on a webpage. Improvements were suggested to check for keywords within the article content itself.
Pagination: Pagination was suggested to handle large volumes of data, allowing users to view results in pages rather than all at once.
Concurrency and Efficiency: Considerations for handling multiple requests efficiently and implementing rate limiting.
Caching: Adding caching to reduce redundant processing and improve performance.
Current Status
The basic functionality of scraping and displaying articles is implemented.
Some advanced features like dynamic keyword searching within articles, pagination, and caching were suggested but not yet implemented.
The frontend provides a simple UI for user interaction, and the backend serves as the API endpoint for fetching and processing data.