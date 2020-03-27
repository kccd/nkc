const cheerio = require("cheerio");
const sourceRender = require("./sourceRender");
const htmlFilter = require("./htmlFilter");

class NKCRender {
  renderHTML(options) {
    // 渲染html
    // <nkcsource></nkcsource>模板解析
    // 学术分判断
    let {
      type = "article",
      html = "",
      resources = []
    } = options;

    // 过滤标签及样式
    html = htmlFilter(html);
    // 渲染文章中的图片、视频、音频等特殊模板
    html = sourceRender(type, html, resources);

    return html
  }
  plainEscape(c) {
    return plainEscape(c);
  }
  renderHTMLToEditor() {

  }
  renderPlain(options) {

  }
}

module.exports = new NKCRender();