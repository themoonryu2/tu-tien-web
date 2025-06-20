// main.js
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.es.js';

const storySelect    = document.getElementById('story-select');
const coverImg       = document.getElementById('story-cover');
const chapterSelect  = document.getElementById('chapter-select');
const titleEl        = document.getElementById('novel-title');
const contentEl      = document.getElementById('novel-content');
const quotesContainer= document.getElementById('quotes-container');

// 1️⃣ Load danh sách truyện
async function loadStories() {
  try {
    const res = await fetch('assets/data/stories.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Stories.json status ${res.status}`);
    const stories = await res.json();
    storySelect.innerHTML = stories.map(s=>
      `<option value="${s.id}">${s.title}</option>`
    ).join('');
    storySelect.addEventListener('change', () => onStoryChange(stories));
    // khởi tạo truyện đầu
    await onStoryChange(stories);
  } catch (err) {
    console.error('Error loading stories:', err);
    titleEl.textContent = 'Lỗi load danh sách truyện';
  }
}

// 2️⃣ Khi chọn truyện
async function onStoryChange(stories) {
  const storyId = storySelect.value;
  const story = stories.find(s=>s.id===storyId);
  coverImg.src = story.cover;
  titleEl.textContent = 'Đang tải mục lục…';
  contentEl.innerHTML = '';

  try {
    const res = await fetch(`/.netlify/functions/fetchChapterList?story=${storyId}`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Status ${res.status}: ${text}`);
    }
    const list = await res.json();
    if (!Array.isArray(list) || !list.length) {
      throw new Error('Không tìm thấy chương nào');
    }
    chapterSelect.innerHTML = list.map(ch =>
      `<option value="${ch.slug}">${ch.title}</option>`
    ).join('');
    chapterSelect.onchange = () => loadChapter(storyId, chapterSelect.value);
    // Load chương đầu
    chapterSelect.value = list[0].slug;
    await loadChapter(storyId, list[0].slug);
  } catch (err) {
    console.error('Error loading chapter list:', err);
    titleEl.textContent = 'Lỗi lấy mục lục';
    chapterSelect.innerHTML = `<option disabled>${err.message}</option>`;
  }
}

// 3️⃣ Load nội dung chương
async function loadChapter(storyId, chapterSlug) {
  titleEl.textContent = 'Đang tải chương…';
  contentEl.innerHTML = '';

  try {
    const res = await fetch(`/.netlify/functions/fetchChapter?story=${storyId}&chapter=${chapterSlug}`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Status ${res.status}: ${text}`);
    }
    const data = await res.json();
    titleEl.textContent = data.title;
    contentEl.innerHTML = DOMPurify.sanitize(data.content);
    contentEl.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error('Error loading chapter:', err);
    titleEl.textContent = 'Lỗi tải chương';
    contentEl.textContent = err.message;
  }
}

// 4️⃣ Load quotes tĩnh
function loadQuotes() {
  const quotes = [
    { t:"Thiên địa vô tình, tu tiên hữu tình.", author:"Cổ Kim" },
    { t:"Lòng người như nước, lúc yên lặng, lúc cuộn sóng.", author:"Ẩn Cảnh" },
    { t:"Anh hùng hào kiệt, giang hồ chỉ là trò chơi phù du.", author:"Giang Sơn" }
  ];
  quotesContainer.innerHTML = quotes.map(q=>`
    <div class="quote-card">
      <blockquote>“${DOMPurify.sanitize(q.t)}”</blockquote>
      <p class="author">— ${DOMPurify.sanitize(q.author)}</p>
    </div>`
  ).join('');
}

// 5️⃣ Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', async () => {
  loadQuotes();
  await loadStories();
});
value || stories[0].id;
  const story = stories.find(s=>s.id===storyId);
  coverImg.src = story.cover;

  // Fetch chapter list
  titleEl.textContent = 'Đang tải mục lục…';
  const chapterList = await fetch(`/.netlify/functions/fetchChapterList?story=${storyId}`)
    .then(r=>r.json());
  chapterSelect.innerHTML = chapterList.map(ch=>
    `<option value="${ch.slug}">${ch.title}</option>`
  ).join('');
  chapterSelect.addEventListener('change', () => loadChapter(storyId, chapterSelect.value));

  // Load first chapter
  const first = chapterList[0]?.slug;
  chapterSelect.value = first;
  await loadChapter(storyId, first);
}

async function loadChapter(storyId, chapter) {
  titleEl.textContent = 'Đang tải chương…';
  contentEl.innerHTML = '';
  try {
    const data = await fetch(`/.netlify/functions/fetchChapter?story=${storyId}&chapter=${chapter}`)
      .then(r=>r.json());
    titleEl.textContent = data.title;
    contentEl.innerHTML = DOMPurify.sanitize(data.content);
    contentEl.scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    titleEl.textContent = 'Lỗi tải';
    contentEl.textContent = e.message;
  }
}
