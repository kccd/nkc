const cheerio = require('cheerio');

function getHTMLText(html = '') {
  const $ = cheerio.load(html);
  return $('body').text();
}

module.exports = {
  getHTMLText,
};
