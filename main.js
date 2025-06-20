// main.js
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.es.js';

const storySelect    = document.getElementById('story-select');
const coverImg       = document.getElementById('story-cover');
const chapterSelect  = document.getElementById('chapter-select');
const titleEl        = document.getElementById('novel-title');
const contentEl      = document.getElementById('novel-content');
const quotesContainer= document.getElementById('quotes-container');

async function loadStories() {
  try {
    const res = await fetch('assets/data/stories.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Stories.json lỗi ${res.status}`);
    const stories = await res.json();
    storySelect.innerHTML = stories.map(s =>
      `<option value="${s.id}">${s.title}</option>`
    ).join('');
    storySelect.onchange = () => onStoryChange(stories);
    await onStoryChange(stories);
  } catch (e) {
    console.error(e);
    titleEl.textContent = 'Lỗi load danh sách truyện';
  }
}

async function onStoryChange(stories) {
  const storyId = storySelect.value || stories[0].id;
  const story = stories.find(s => s.id === storyId);
  coverImg.src = story.cover;
  titleEl.textContent = 'Đang tải mục lục…';
  contentEl.innerHTML = '';
  try {
    const res = await fetch(`/.netlify/functions/fetchChapterList?story=${storyId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`fetchChapterList lỗi ${res.status}`);
    const list = await res.json();
    if (!list.length) throw new Error('Không có chương');
    chapterSelect.innerHTML = list.map(ch =>
      `<option value="${ch.slug}">${ch.title}</option>`
    ).join('');
    chapterSelect.onchange = () => loadChapter(storyId, chapterSelect.value);
    chapterSelect.value = list[0].slug;
    await loadChapter(storyId, list[0].slug);
  } catch (e) {
    console.error(e);
    titleEl.textContent = 'Lỗi lấy mục lục';
    chapterSelect.innerHTML = `<option disabled>${e.message}</option>`;
  }
}

async function loadChapter(storyId, chapterSlug) {
  titleEl.textContent = 'Đang tải chương…';
  contentEl.innerHTML = '';
  try {
    const res = await fetch(`/.netlify/functions/fetchChapter?story=${storyId}&chapter=${chapterSlug}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`fetchChapter lỗi ${res.status}`);
    const data = await res.json();
    titleEl.textContent = data.title;
    contentEl.innerHTML = DOMPurify.sanitize(data.content);
    contentEl.scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    console.error(e);
    titleEl.textContent = 'Lỗi tải chương';
    contentEl.textContent = e.message;
  }
}

function loadQuotes() {
  const quotes = [
    { t:"Thiên địa vô tình, tu tiên hữu tình.", author:"Cổ Kim" },
    { t:"Lòng người như nước, lúc yên lặng, lúc cuộn sóng.", author:"Ẩn Cảnh" },
    { t:"Anh hùng hào kiệt, giang hồ chỉ là trò chơi phù du.", author:"Giang Sơn" }
  ];
  quotesContainer.innerHTML = quotes.map(q => `
    <div class="quote-card">
      <blockquote>“${DOMPurify.sanitize(q.t)}”</blockquote>
      <p class="author">— ${DOMPurify.sanitize(q.author)}</p>
    </div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  loadStories();
});
