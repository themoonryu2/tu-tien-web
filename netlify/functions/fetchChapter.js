import fetch from "node-fetch";
import cheerio from "cheerio";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export const handler = async ({ queryStringParameters }) => {
  try {
    const { story: storyId, chapter } = queryStringParameters || {};
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const data = JSON.parse(
      readFileSync(resolve(__dirname, "../../assets/data/stories.json"), "utf-8")
    );
    const story = data.find((s) => s.id === storyId);
    if (!story) throw new Error("Unknown story");

    const url = `${story.baseUrl}/${chapter}/`;
    const html = await fetch(url).then((r) => r.text());
    const $ = cheerio.load(html);
    const title = $("h1#chapter-heading").text().trim() || chapter;
    const content = $("#chapter-content").html() || "<p>No content</p>";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "max-age=300", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ title, content }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
