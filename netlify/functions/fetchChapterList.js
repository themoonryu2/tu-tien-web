// netlify/functions/fetchChapterList.js
import fetch from "node-fetch";
import cheerio from "cheerio";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export const handler = async ({ queryStringParameters }) => {
  try {
    const storyId = queryStringParameters?.story;
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const dataPath = resolve(__dirname, "../../assets/data/stories.json");
    const stories  = JSON.parse(readFileSync(dataPath, "utf-8"));
    const s = stories.find(x => x.id === storyId);
    if (!s) throw new Error(`Unknown story: ${storyId}`);

    const tocUrl = `${s.baseUrl}/`;
    console.log("Fetching TOC from:", tocUrl);
    const res = await fetch(tocUrl);
    if (!res.ok) throw new Error(`Fetch TOC status ${res.status}`);
    const html = await res.text();
    const $    = cheerio.load(html);

    // Hai selector để phòng khi đổi class
    const links = $("ul.list-chapter a").length
      ? $("ul.list-chapter a")
      : $(".chapter-list a");

    const list = [];
    links.each((_, el) => {
      const href = $(el).attr("href");
      const slug = href?.split("/").filter(Boolean).pop();
      const title = $(el).text().trim();
      if (slug && title) list.push({ slug, title });
    });

    if (!list.length) {
      console.error("No chapters found. HTML snapshot:", html.slice(0,500));
      throw new Error("No chapters found");
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "max-age=300"
      },
      body: JSON.stringify(list)
    };
  } catch (e) {
    console.error("fetchChapterList error:", e.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "fetchChapterList lỗi " + e.message })
    };
  }
};
