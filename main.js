const stories = await fetch('assets/data/stories.json').then(r=>r.json());
const storySelect = document.getElementById('story-select');
const coverImg = document.getElementById('story-cover');
const chapterSelect = document.getElementById('chapter-select');
const titleEl = document.getElementById('novel-title');
const contentEl = document.getElementById('novel-content');
const quotesContainer = document.getElementById('quotes-container');

// Populate story dropdown
storySelect.innerHTML = stories.map(s=>
  `<option value="${s.id}">${s.title}</option>`
).join('');
storySelect.addEventListener('change', onStoryChange);

// Load quotes
const quotes = [
  { t:"Thiên địa vô tình, tu tiên hữu tình.", author:"Cổ Kim" },
  { t:"Lòng người như nước, lúc yên lặng, lúc cuộn sóng.", author:"Ẩn Cảnh" },
  { t:"Anh hùng hào kiệt, giang hồ chỉ là trò chơi phù du.", author:"Giang Sơn" }
];
quotesContainer.innerHTML = quotes.map(q=>`
  <div class="quote-card">
    <blockquote>“${DOMPurify.sanitize(q.t)}”</blockquote>
    <div class="author">— ${DOMPurify.sanitize(q.author)}</div>
  </div>`).join('');

// On page load
onStoryChange();

async function onStoryChange() {
  const storyId = storySelect.value || stories[0].id;
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
