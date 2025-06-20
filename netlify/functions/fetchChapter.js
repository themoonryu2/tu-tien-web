// netlify/functions/fetchChapter.js
import fetch from "node-fetch";
import cheerio from "cheerio";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export const handler = async ({ queryStringParameters }) => {
  try {
    const { story: storyId, chapter } = queryStringParameters || {};
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const stories = JSON.parse(
      readFileSync(resolve(__dirname, "../../assets/data/stories.json"), "utf-8")
    );
    const story = stories.find(s => s.id === storyId);
    if (!story) throw new Error("Unknown story");

    const url = `${story.baseUrl}/${chapter}/`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $("h1.title-chapter, .chapter-title").first().text().trim() || chapter;
    const content = $("#chapter-content, .chapter-content").first().html() || "<p>Không có nội dung</p>";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "max-age=300"
      },
      body: JSON.stringify({ title, content })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
