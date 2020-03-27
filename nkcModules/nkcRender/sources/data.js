const cheerio = require("../cheerio");

module.exports = {
  picture(html) {
    const $ = cheerio.load(html);
    $("nkcsource").html("");
    html = $("body").html();
    return html
  },
  video(html) {
    const $ = cheerio.load(html);
    $("nkcsource").html("");
    html = $("body").html();
    return html
  },
  xsf(html) {
    return html;
  },
  attachment(html) {
    const $ = cheerio.load(html);
    $("nkcsource").html("");
    html = $("body").html();
    return html
  },
  sticker(html) {
    const $ = cheerio.load(html);
    $("nkcsource").html("");
    html = $("body").html();
    return html
  },
  audio(html) {
    const $ = cheerio.load(html);
    $("nkcsource").html("");
    html = $("body").html();
    return html
  },
  pre(html) {
    return html;
  },
  twemoji(html) {
    const $ = cheerio.load(html);
    $("nkcsource").html("");
    html = $("body").html();
    return html
  },
  formula(html) {
    return html;
  }
};