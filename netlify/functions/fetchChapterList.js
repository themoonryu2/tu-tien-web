import fetch from "node-fetch";
import cheerio from "cheerio";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

export const handler = async ({ queryStringParameters }) => {
  try {
    const { story } = queryStringParameters || {};
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const data = JSON.parse(
      readFileSync(resolve(__dirname, "../../assets/data/stories.json"), "utf-8")
    );
    const s = data.find(x => x.id === story);
    if (!s) throw new Error("Unknown story");

    const res = await fetch(s.baseUrl, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Selector mục lục trên sstruyen.vn
    const links = $(".list-chapter li a, .chapter-list a");
    if (!links.length) throw new Error("No chapters found");

    const chapters = [];
    links.each((_, el) => {
      const href = $(el).attr("href");
      const slug = href.split("/").filter(Boolean).pop();
      const title = $(el).text().trim();
      chapters.push({ slug, title });
    });

    return {
      statusCode: 200,
      headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" },
      body: JSON.stringify(chapters)
    };
  } catch (e) {
    console.error(e);
    return { statusCode:500, body: JSON.stringify({ error: e.message }) };
  }
};
