document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('scrape-form');
  const resultsDiv = document.getElementById('results');
  const keywordInput = document.getElementById('keyword');
  const urlInput = document.getElementById('url');
  const pageInput = document.getElementById('page');
  const limitInput = document.getElementById('limit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value;
    const keyword = keywordInput.value.trim();
    const page = pageInput.value || 1;
    const limit = limitInput.value || 10;

    try {
      const response = await fetch(`/scrape?website=${encodeURIComponent(url)}&keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`);
      const data = await response.json();

      displayArticles(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      resultsDiv.innerHTML = '<p>Error fetching news. Please try again.</p>';
    }
  });

  function displayArticles(data) {
    if (data && data.articles) {
      resultsDiv.innerHTML = '';
      data.articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article');
        articleDiv.innerHTML = `
          <h2><a href="${article.url}" target="_blank">${article.title}</a></h2>
          <p>Source: ${article.source}</p>
        `;
        resultsDiv.appendChild(articleDiv);
      });

      if (data.total > data.articles.length) {
        const paginationDiv = document.createElement('div');
        paginationDiv.classList.add('pagination');
        paginationDiv.innerHTML = `
          <a href="#" onclick="changePage(${data.page - 1})">Previous</a>
          <a href="#" onclick="changePage(${data.page + 1})">Next</a>
        `;
        resultsDiv.appendChild(paginationDiv);
      }
    } else {
      resultsDiv.innerHTML = '<p>No articles found.</p>';
    }
  }

  window.changePage = (newPage) => {
    if (newPage > 0) {
      pageInput.value = newPage;
      form.dispatchEvent(new Event('submit'));
    }
  }
});
