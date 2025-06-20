import fetch from "node-fetch";
import cheerio from "cheerio";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export const handler = async ({ queryStringParameters }) => {
  try {
    const storyId = queryStringParameters?.story;
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const data = JSON.parse(
      readFileSync(resolve(__dirname, "../../assets/data/stories.json"), "utf-8")
    );
    const story = data.find((s) => s.id === storyId);
    if (!story) throw new Error("Unknown story");

    const html = await fetch(story.baseUrl).then((r) => r.text());
    const $ = cheerio.load(html);
    const chapters = [];
    $(".chapter-list a").each((_, el) => {
      const href = $(el).attr("href");
      const slug = href.split("/").filter(Boolean).pop();
      const title = $(el).text().trim();
      if (slug && title) chapters.push({ slug, title });
    });
    if (!chapters.length) throw new Error("No chapters found");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "max-age=300", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(chapters),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
