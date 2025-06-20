// netlify/functions/fetchChapterList.js
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const stories = require('../../assets/data/stories.json');

exports.handler = async ({ queryStringParameters }) => {
  try {
    const storyId = queryStringParameters.story;
    const s = stories.find(x => x.id === storyId);
    if (!s) throw new Error("Unknown story");
    const html = await fetch(s.baseUrl).then(r => r.text());
    const $ = cheerio.load(html);
    const list = [];
    $('.chapter-list a').each((_, el) => {
      const href = $(el).attr('href');
      const slug = href.split('/').filter(Boolean).pop();
      const title = $(el).text().trim();
      if (slug && title) list.push({ slug, title });
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type':'application/json','Access-Control-Allow-Origin':'*' },
      body: JSON.stringify(list)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
