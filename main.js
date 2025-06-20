const base = "https://sstruyen.vn/bi-thu-trung-sinh";
const proxy = url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

const chapSel = document.getElementById("chapter-select");
const cover   = document.getElementById("cover");
const titleEl = document.getElementById("title");
const content = document.getElementById("content");

// Tạo dropdown 1→100 (dự phòng nếu không lấy được list động)
chapSel.innerHTML = Array.from({length:100},(_,i)=>
  `<option value="chuong-${i+1}">Chương ${i+1}</option>`
).join("");
chapSel.onchange = ()=>loadChapter(chapSel.value);

async function loadChapter(slug){
  titleEl.textContent="Đang tải…"; content.innerHTML="";
  cover.src = `${base}/${slug}/`; // cover URL giả, vì site không rõ cover
  try {
    const res = await fetch(proxy(`${base}/${slug}/`));
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html,"text/html");
    const t = doc.querySelector("h1")?.textContent || slug;
    const c = doc.querySelector(".chapter-content")?.innerHTML || "<p>Không có nội dung</p>";
    titleEl.textContent = DOMPurify.sanitize(t);
    content.innerHTML = DOMPurify.sanitize(c);
  } catch(e){
    titleEl.textContent="Lỗi tải"; content.textContent=e.message;
  }
}

// Load chương 1 mặc định
loadChapter("chuong-1");
