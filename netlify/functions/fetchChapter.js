// netlify/functions/fetchChapter.js
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const stories = require('../../assets/data/stories.json');

exports.handler = async ({ queryStringParameters }) => {
  try {
    const { story, chapter } = queryStringParameters;
    const s = stories.find(x => x.id === story);
    if (!s) throw new Error("Unknown story");
    const url = `${s.baseUrl}/${chapter}/`;
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);
    const title = $('h1#chapter-heading').text().trim() || chapter;
    const content = $('#chapter-content').html() || '<p>No content</p>';
    return {
      statusCode: 200,
      headers: { 'Content-Type':'application/json','Access-Control-Allow-Origin':'*' },
      body: JSON.stringify({ title, content })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
