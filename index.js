const API_KEY = "api-key";
const url = "https://newsapi.org/v2/everything?q=";

window.addEventListener("load", () => fetchNews("India"));

function reload() {
    window.location.reload();
}

async function fetchNews(query) {
    const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
    const data = await res.json();
    bindData(data.articles);
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    const description = article.description || "No description available.";

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date} `;

    // Open full news
    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });

    /* ---------- Mood Indicator ---------- */
    const tone = getTone(article.title + " " + description);
    const toneBadge = document.createElement("span");
    toneBadge.className = `tone ${tone}`;
    toneBadge.textContent =
        tone === "positive" ? "🟢 Positive" :
        tone === "negative" ? "🔴 Negative" :
        "🟡 Neutral";

    newsTitle.before(toneBadge);

    /* ---------- Bookmark ---------- */
    const bookmark = document.createElement("span");
    bookmark.className = "bookmark";
    bookmark.textContent = "♡";

    let bookmarks = getBookmarks();
    if (bookmarks.some(b => b.url === article.url)) {
        bookmark.classList.add("active");
        bookmark.textContent = "♥";
    }

    bookmark.onclick = (e) => {
        e.stopPropagation();

        let bookmarks = getBookmarks();
        if (bookmark.classList.contains("active")) {
            bookmarks = bookmarks.filter(b => b.url !== article.url);
            bookmark.classList.remove("active");
            bookmark.textContent = "♡";
        } else {
            bookmarks.push(article);
            bookmark.classList.add("active");
            bookmark.textContent = "♥";
        }
        saveBookmarks(bookmarks);
    };

    newsSource.appendChild(bookmark);

    /* ---------- Reading Time ---------- */
    const words = description.split(" ").length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    const readTimeTag = document.createElement("small");
    readTimeTag.textContent = ` ⏱️ ${readTime} min read`;

    newsTitle.after(readTimeTag);
    
/* ---------- Translate Button ---------- */
const translateBtn = document.createElement("button");
translateBtn.textContent =  "🌐 Translate";
translateBtn.className = "translateBtn";

translateBtn.onclick = async (e) => {
    e.stopPropagation();

    const lang = document.getElementById("language").value;

    const translatedTitle = await translateText(article.title, lang);
    const translatedDesc = await translateText(description, lang);

    newsTitle.innerHTML = translatedTitle;
    newsDesc.innerHTML = translatedDesc;
};

newsSource.appendChild(translateBtn);

}

let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

function getTone(text) {
    const positiveWords = ["growth", "win", "success", "record", "profit"];
    const negativeWords = ["death", "crisis", "loss", "war", "attack"];

    text = text.toLowerCase();

    if (negativeWords.some(word => text.includes(word))) return "negative";
    if (positiveWords.some(word => text.includes(word))) return "positive";
    return "neutral";
}
function getBookmarks() {
  return JSON.parse(localStorage.getItem("bookmarks")) || [];
}

function saveBookmarks(data) {
  localStorage.setItem("bookmarks", JSON.stringify(data));
}

const suggestionList = ["Politics", "Cricket", "Economy", "Science", "Technology"];

searchText.addEventListener("input", () => {
  const val = searchText.value.toLowerCase();
  const box = document.getElementById("suggestions");
  box.innerHTML = "";

  if (!val) return;

  suggestionList
    .filter(item => item.toLowerCase().startsWith(val))
    .forEach(item => {
      const div = document.createElement("div");
      div.textContent = item;
      div.onclick = () => {
        searchText.value = item;
        box.innerHTML = "";
        fetchNews(item);
      };
      box.appendChild(div);
    });
});

document.getElementById("region").addEventListener("change", (e) => {
  fetchNews(e.target.value);
});
function toggleDark() {
  document.body.classList.toggle("dark");
}

function toggleAccessible() {
  document.body.classList.toggle("accessible");
}
function showBookmarks() {
  const cardsContainer = document.getElementById("cards-container");
  cardsContainer.innerHTML = "";

  const bookmarks = getBookmarks();

  if (bookmarks.length === 0) {
    cardsContainer.innerHTML = `
      <h2 style="text-align:center; width:100%">
        No bookmarked news yet ❤️
      </h2>
    `;
    return;
  }

  bookmarks.forEach(article => {
    const newsCardTemplate = document.getElementById("template-news-card");
    const cardClone = newsCardTemplate.content.cloneNode(true);
    fillDataInCard(cardClone, article);
    cardsContainer.appendChild(cardClone);
  });
}

async function translateText(text, targetLang) {
  if (targetLang === "en") return text;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    );

    const data = await res.json();
    return data.responseData.translatedText;

  } catch (err) {
    console.log("Translation error", err);
    return text;
  }
}

document.getElementById("language").addEventListener("change", () => {
  const query = searchText.value || "India";
  fetchNews(query);
});

