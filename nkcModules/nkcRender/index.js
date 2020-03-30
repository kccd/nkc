const cheerio = require("./cheerio");
const htmlFilter = require("./htmlFilter");

const plainEscape = require("../plainEscaper");
const fs = require("fs");
const path = require("path");
const filePath = path.resolve(__dirname, "./sources");
const files = fs.readdirSync(filePath);
const sources = {};
for(const filename of files) {
  const name = filename.split(".")[0];
  sources[name] = require(filePath + `/${name}`);
}

class NKCRender {
  renderHTML(options) {
    // 渲染html
    // <nkcsource></nkcsource>模板解析
    // 学术分判断
    let {
      type = "article",
      post = {},
      user = {},
    } = options;

    const {resources = [], atUser = []} = post;
    let html = post.c || "";
    // 过滤标签及样式
    html = htmlFilter(html);
    // 序列化html
    const $ = cheerio.load(html);
    // 渲染文章中的图片、视频、音频等特殊模板
    const _resources = {};
    for(const r of resources) {
      _resources[r.rid] = r
    }
    const sourceMethods = sources[type];
    for(const name in sourceMethods) {
      if(!sourceMethods.hasOwnProperty(name)) continue;
      const method = sourceMethods[name];
      $(`nkcsource[data-type="${name}"]`).replaceWith(function() {
        const dom = $(this);
        const _html = dom.toString();
        const id = dom.data().id + "";
        const resource = _resources[id];
        if(resource) {
          resource.oname = plainEscape(resource.oname || "");
        }
        return method(_html, id, resource, user);
      });
    }

    // @检测

    return $("body").html();
  }

  plainEscape(c) {
    return plainEscape(c);
  }
  HTMLToPlain(html, count) {
    const $ = cheerio.load(html);
    let text = $.text();
    const textLength = text.length;
    text = text.slice(0, count);
    if(count < textLength) text += "...";
    return text;
  }
  renderPlain(options) {

  }
}

module.exports = new NKCRender();