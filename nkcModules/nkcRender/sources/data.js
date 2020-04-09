const cheerio = require("../customCheerio");

module.exports = {
  // picture(html) {
  //   const $ = cheerio.load(html);
  //   $("nkcsource").html("");
  //   html = $("body").html();
  //   return html
  // },
  // video(html) {
  //   const $ = cheerio.load(html);
  //   $("nkcsource").html("");
  //   html = $("body").html();
  //   return html
  // },
  // xsf(html) {
  //   const $ = cheerio.load(html);
  //   let content = $("nkcsource > strong").text();
  //   $("nkcsource").html(content);
  //   return $("body").html();
  // },
  // attachment(html) {
  //   const $ = cheerio.load(html);
  //   $("nkcsource").html("");
  //   html = $("body").html();
  //   return html
  // },
  // sticker(html) {
  //   const $ = cheerio.load(html);
  //   $("nkcsource").html("");
  //   html = $("body").html();
  //   return html
  // },
  // audio(html) {
  //   const $ = cheerio.load(html);
  //   $("nkcsource").html("");
  //   html = $("body").html();
  //   return html
  // },
  // pre(html) {
  //   return html;
  // },
  // twemoji(html) {
  //   const $ = cheerio.load(html);
  //   $("nkcsource").html("");
  //   html = $("body").html();
  //   return html
  // },
  // formula(html, id) {
  //   const $ = cheerio.load(html);
  //   const nkcSource = $("nkcsource");
  //   let text = nkcSource.text();
  //   if(id === "1") {
  //     text = text.replace(/^\$(.+?)\$$/i, "$1")
  //   } else if(id === "2") {
  //     text = text.replace(/^\\\((.+?)\\\)$/i, "$1")
  //   } else if(id === "3") {
  //     text = text.replace(/^\$\$(.+?)\$\$$/i, "$1")
  //   } else {
  //     text = text.replace(/^\\\[(.+?)\\]$/i, "$1")
  //   }
  //   nkcSource.html(text);
  //   return $("body").html();
  // }
};