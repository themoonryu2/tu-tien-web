import fetch from "node-fetch";
import cheerio from "cheerio";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

export const handler = async ({ queryStringParameters }) => {
  try {
    const { story, chapter } = queryStringParameters || {};
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const data = JSON.parse(
      readFileSync(resolve(__dirname, "../../assets/data/stories.json"), "utf-8")
    );
    const s = data.find(x => x.id === story);
    if (!s) throw new Error("Unknown story");

    const url = `${s.baseUrl}/${chapter}/`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    const title   = $("h1.title-chapter, .chapter-title").first().text().trim() || chapter;
    const content = $("#chapter-content, .chapter-content").first().html() || "<p>Empty</p>";

    return {
      statusCode:200,
      headers:{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" },
      body: JSON.stringify({ title, content })
    };
  } catch (e) {
    console.error(e);
    return { statusCode:500, body: JSON.stringify({ error: e.message }) };
  }
};
