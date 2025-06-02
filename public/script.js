document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("scrape-form");
  const resultsDiv = document.getElementById("results");
  const keywordInput = document.getElementById("keyword");
  const urlInput = document.getElementById("url");
  const pageInput = document.getElementById("page");
  const limitInput = document.getElementById("limit");

  // Initialize inputs with existing values
  const savedKeyword = localStorage.getItem("keyword");
  const savedUrl = localStorage.getItem("url");
  const savedPage = localStorage.getItem("page") || 1;
  const savedLimit = localStorage.getItem("limit") || 10;

  if (savedKeyword) keywordInput.value = savedKeyword;
  if (savedUrl) urlInput.value = savedUrl;
  pageInput.value = savedPage;
  limitInput.value = savedLimit;

  // Add event listener for form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();
    const keyword = keywordInput.value.trim();
    const page = pageInput.value || 1;
    const limit = limitInput.value || 10;

    // Validate URL
    if (!url.match(/^https?:\/\/.+/)) {
      resultsDiv.innerHTML = "<p>Please enter a valid URL starting with http:// or https://</p>";
      return;
    }

    resultsDiv.innerHTML = "<p>Loading...</p>";

    try {
      const response = await fetch(
        `/scrape?website=${encodeURIComponent(url)}&keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Server error: ${response.status} ${response.statusText}. Response: ${text.slice(0, 100)}...`);
      }

      const data = await response.json();

      // Store input values in localStorage
      localStorage.setItem("keyword", keyword);
      localStorage.setItem("url", url);
      localStorage.setItem("page", page);
      localStorage.setItem("limit", limit);

      displayArticles(data);
    } catch (error) {
      console.error("Error fetching news:", error);
      resultsDiv.innerHTML = `<p>Error: ${error.message}. Please check the URL, try a different website, or try again later.</p>`;
    }
  });

  // Function to display articles
  function displayArticles(data) {
    const { articles = [], page, limit, total, failedLinks = 0 } = data;
    resultsDiv.innerHTML = "";

    if (articles.length > 0) {
      articles.forEach((article) => {
        const articleDiv = document.createElement("div");
        articleDiv.classList.add("article");
        articleDiv.innerHTML = `
          <h2><a href="${article.url}" target="_blank">${article.title}</a></h2>
          <p>Source: ${article.source}</p>
        `;
        resultsDiv.appendChild(articleDiv);
      });

      // Add note if some articles failed to load
      if (failedLinks > 0) {
        const noteDiv = document.createElement("div");
        noteDiv.innerHTML = `<p>Note: ${failedLinks} article(s) could not be fetched due to errors.</p>`;
        resultsDiv.appendChild(noteDiv);
      }

      // Add pagination if applicable
      if (total > limit) {
        const paginationDiv = document.createElement("div");
        paginationDiv.classList.add("pagination");
        paginationDiv.innerHTML = `
          ${page > 1 ? `<a href="#" onclick="changePage(${page - 1})">Previous</a>` : ""}
          <span>Page ${page} of ${Math.ceil(total / limit)}</span>
          ${page * limit < total ? `<a href="#" onclick="changePage(${page + 1})">Next</a>` : ""}
        `;
        resultsDiv.appendChild(paginationDiv);
      }
    } else {
      resultsDiv.innerHTML = "<p>No articles found. Please try another keyword or URL.</p>";
    }
  }

  // Function to change the page
  window.changePage = (newPage) => {
    if (newPage > 0) {
      pageInput.value = newPage;
      form.dispatchEvent(new Event("submit"));
    }
  };
});