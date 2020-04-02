const cheerio = require("cheerio");
module.exports = {
  load(html) {
    return cheerio.load(html, {
      decodeEntities: false
    });
  }
};