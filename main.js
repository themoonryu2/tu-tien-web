// main.js
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.es.js';
import stories from './assets/data/stories.json' assert { type: 'json' };

const storySelect   = document.getElementById('story-select');
const coverImg      = document.getElementById('story-cover');
const chapterSelect = document.getElementById('chapter-select');
const titleEl       = document.getElementById('novel-title');
const contentEl     = document.getElementById('novel-content');
const quotesContainer = document.getElementById('quotes-container');

// Populate story dropdown
storySelect.innerHTML = stories.map(s=>
  `<option value="${s.id}">${s.title}</option>`
).join('');
storySelect.addEventListener('change', initStory);
initStory();

async function initStory() {
  const storyId = storySelect.value || stories[0].id;
  const story = stories.find(s=>s.id===storyId);
  coverImg.src = story.cover;
  titleEl.textContent = 'Đang tải mục lục…';
  contentEl.innerHTML = '';
  try {
    const list = await fetch(`/.netlify/functions/fetchChapterList?story=${storyId}`, { cache:'no-store' })
      .then(r=>{
        if(!r.ok) throw new Error(r.status);
        return r.json();
      });
    chapterSelect.innerHTML = list.map(ch=>
      `<option value="${ch.slug}">${ch.title}</option>`
    ).join('');
    chapterSelect.onchange = ()=>loadChapter(story, chapterSelect.value);
    chapterSelect.value = list[0].slug;
    await loadChapter(story, chapterSelect.value);
  } catch(e) {
    console.error(e);
    titleEl.textContent = 'Lỗi lấy mục lục';
  }
}

async function loadChapter(story, slug) {
  titleEl.textContent = 'Đang tải chương…';
  contentEl.innerHTML = '';
  try {
    const data = await fetch(`/.netlify/functions/fetchChapter?story=${story.id}&chapter=${slug}`, { cache:'no-store' })
      .then(r=>{
        if(!r.ok) throw new Error(r.status);
        return r.json();
      });
    titleEl.textContent = data.title;
    contentEl.innerHTML = DOMPurify.sanitize(data.content);
    contentEl.scrollIntoView({ behavior:'smooth' });
  } catch(e) {
    console.error(e);
    titleEl.textContent = 'Lỗi tải chương';
  }
}

// Static quotes
const quotes = [
  { t:"Thiên địa vô tình, tu tiên hữu tình.", author:"Cổ Kim" },
  { t:"Lòng người như nước, lúc yên lặng, lúc cuộn sóng.", author:"Ẩn Cảnh" },
  { t:"Anh hùng hào kiệt, giang hồ chỉ là trò chơi phù du.", author:"Giang Sơn" }
];
quotesContainer.innerHTML = quotes.map(q=>`
  <div class="quote-card">
    <blockquote>“${DOMPurify.sanitize(q.t)}”</blockquote>
    <p class="author">— ${DOMPurify.sanitize(q.author)}</p>
  </div>`).join('');
