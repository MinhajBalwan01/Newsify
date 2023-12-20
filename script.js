const title = document.querySelector('.title');
const resultNo = document.querySelector('.results');
const searchInput = document.getElementById('search');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const sortFilter = document.getElementById('sortFilter');
let currentPage = 1;

// Disable the previous button initially
prevBtn.disabled = true;

function formatDate(apiDate) {
    const dateObj = new Date(apiDate);
    return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function template(article) {
    const dateStr = formatDate(article.publishedAt);

    return `<article class="card">
        <div class="image-container">
            <img src="${article.urlToImage}" alt="${article.title}">
        </div>
        <div class="card-body">
            <h1>${article.title}</h1>
            <p>${article.description}</p>
        </div>
        <div class="meta-area">
            <div class="meta">
                <span class="name">${article.source.name}</span>
                <span class="date">${dateStr}</span>
            </div>
            <div class="buttons">
                <a target="_blank" title="Read More" aria-label="Read More" href="${article.url}" class="ph-bold icon ph-arrow-up-right"></a>
                <button aria-label="Share article" class="ph-bold icon ph-share-network share-button"></button>
            </div>
        </div>
    </article>`;
}

function getSelectedValue() {
    return sortFilter.value;
}

async function sharePost(article) {
    try {
        const shareData = {
            title: article.title,
            text: article.description,
            url: article.url
        };

        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            alert('Share option not supported by browser');
        }
    } catch (error) {
        console.error('Error sharing:', error);
    }
}

async function fetchNews(pageNo, value, sort) {
    const apiKey = 'dc8ecd9027954486a7b08ee484827974';
    const sortValue = sort || 'publishedAt';
    const qVal = value || 'top headlines';
    const url = `https://newsapi.org/v2/everything?q=${qVal}&sortBy=${sortValue}&language=en&pageSize=15&page=${pageNo}&apiKey=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const postContainer = document.querySelector('.post-container');
        postContainer.innerHTML = '';

        data.articles.forEach(article => {
            if (article.urlToImage && article.title && article.description) {
                const templateHTML = template(article);
                postContainer.innerHTML += templateHTML;
            }
        });

        const shareBtns = document.querySelectorAll('.share-button');
        shareBtns.forEach(share => {
            share.addEventListener('click', () => {
                const articleElement = share.closest('.card');
                const articleData = {
                    title: articleElement.querySelector('h1').innerText,
                    description: articleElement.querySelector('p').innerText,
                    url: articleElement.querySelector('a').href,
                };
                sharePost(articleData);
            });
        });

        if (data.totalResults === 0) {
            title.innerHTML = '';
            postContainer.innerHTML = `<div class="error">
                <h1>404</h1>
                <p>Sorry, no results found for ${qVal}!</p>
            </div>`;
        } else if (qVal === 'top headlines') {
            title.innerHTML = 'Top Headlines';
            resultNo.innerHTML = '';
        } else {
            title.innerHTML = value;
            resultNo.innerHTML = `About ${data.totalResults} results`;
        }
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

function updateSortFilter() {
    const selectedSort = getSelectedValue();
    fetchNews(1, searchInput.value.trim(), selectedSort);
}

function handlePrevButtonClick() {
    if (currentPage > 1) {
        currentPage--;
        fetchNews(currentPage, searchInput.value.trim(), getSelectedValue());
    }

    prevBtn.disabled = currentPage === 1;
}

function handleNextButtonClick() {
    currentPage++;
    fetchNews(currentPage, searchInput.value.trim(), getSelectedValue());
    prevBtn.disabled = false;
}

searchInput.addEventListener('keypress', async e => {
    if (e.key === 'Enter') {
        currentPage = 1;
        await fetchNews(currentPage, searchInput.value.trim());
    }
});

prevBtn.addEventListener('click', handlePrevButtonClick);
nextBtn.addEventListener('click', handleNextButtonClick);
sortFilter.addEventListener('change', updateSortFilter);

// Initial fetch with default values
fetchNews(currentPage, 'top headlines', 'publishedAt');
