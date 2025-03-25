document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements
  const form = document.getElementById('scrape-form');
  const resultsDiv = document.getElementById('results');
  const keywordInput = document.getElementById('keyword');
  const urlInput = document.getElementById('url');
  const pageInput = document.getElementById('page');
  const limitInput = document.getElementById('limit');

  // Initialize inputs with existing values (in case the page was refreshed)
  const savedKeyword = localStorage.getItem('keyword');
  const savedUrl = localStorage.getItem('url');
  const savedPage = localStorage.getItem('page') || 1;
  const savedLimit = localStorage.getItem('limit') || 10;

  if (savedKeyword) keywordInput.value = savedKeyword;
  if (savedUrl) urlInput.value = savedUrl;
  pageInput.value = savedPage;
  limitInput.value = savedLimit;

  // Add event listener for form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get input values
    const url = urlInput.value.trim();
    const keyword = keywordInput.value.trim();
    const page = pageInput.value || 1;
    const limit = limitInput.value || 10;

    try {
      // Fetch the results from the server
      const response = await fetch(`/scrape?website=${encodeURIComponent(url)}&keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`);
      const data = await response.json();

      // Store input values in localStorage to persist between refreshes
      localStorage.setItem('keyword', keyword);
      localStorage.setItem('url', url);
      localStorage.setItem('page', page);
      localStorage.setItem('limit', limit);

      // Display articles
      //FIX
      displayArticles(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      resultsDiv.innerHTML = '<p>Error fetching news. Please try again.</p>';
    }
  });

  // Function to display articles
  function displayArticles(data) {
    // Preserve input values in case of no articles or error
    const { articles = [] } = data;

    if (articles.length > 0) {
      resultsDiv.innerHTML = ''; // Clear previous results
      articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article');
        articleDiv.innerHTML = `
          <h2><a href="${article.url}" target="_blank">${article.title}</a></h2>
          <p>Source: ${article.source}</p>
        `;
        resultsDiv.appendChild(articleDiv);
      });

      // Add pagination if applicable
      if (data.total > articles.length) {
        const paginationDiv = document.createElement('div');
        paginationDiv.classList.add('pagination');
        paginationDiv.innerHTML = `
          <a href="#" onclick="changePage(${data.page - 1})">Previous</a>
          <a href="#" onclick="changePage(${data.page + 1})">Next</a>
        `;
        resultsDiv.appendChild(paginationDiv);
      }
    } else {
      // Show "No results" message but retain inputs
      resultsDiv.innerHTML = '<p>No articles found. Please try another keyword or URL.</p>';
    }
  }

  // Function to change the page when pagination links are clicked
  window.changePage = (newPage) => {
    if (newPage > 0) { // Ensure valid page number
      pageInput.value = newPage;
      form.dispatchEvent(new Event('submit')); // Trigger form submission
    }
  };
});
