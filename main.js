import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.es.js';

const storySelect   = document.getElementById('story-select');
const coverImg      = document.getElementById('story-cover');
const chapSelect    = document.getElementById('chapter-select');
const chapTitle     = document.getElementById('chapter-title');
const chapContent   = document.getElementById('story-content');
const stories       = await fetch('assets/data/stories.json').then(r=>r.json());

storySelect.innerHTML = stories.map(s=>
  `<option value="${s.id}">${s.title}</option>`
).join('');
storySelect.addEventListener('change', init);
chapSelect.addEventListener('change', ()=>loadChapter(storySelect.value, chapSelect.value));

init();
async function init(){
  const sid = storySelect.value || stories[0].id;
  const s = stories.find(x=>x.id===sid);
  coverImg.src = s.cover;
  try {
    const list = await fetch(`/.netlify/functions/fetchChapterList?story=${sid}`)
                     .then(r=>r.ok? r.json(): Promise.reject(r.status));
    chapSelect.innerHTML = list.map(c=>`<option value="${c.slug}">${c.title}</option>`).join('');
    loadChapter(sid, list[0].slug);
  } catch(e){
    chapTitle.textContent = 'Lỗi lấy mục lục';
    console.error(e);
  }
}

async function loadChapter(sid, slug){
  chapTitle.textContent = 'Đang tải chương…';
  chapContent.innerHTML = '';
  try {
    const data = await fetch(`/.netlify/functions/fetchChapter?story=${sid}&chapter=${slug}`)
                       .then(r=>r.ok? r.json(): Promise.reject(r.status));
    chapTitle.textContent = data.title;
    chapContent.innerHTML = DOMPurify.sanitize(data.content);
  } catch(e){
    chapTitle.textContent = 'Lỗi tải chương';
    console.error(e);
  }
}
