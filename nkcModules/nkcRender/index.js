const cheerio = require("./cheerio");
const htmlFilter = require("./htmlFilter");
const twemoji = require("twemoji");
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
    const {resources = [], atUsers = []} = post;
    let html = post.c || "";
    // 序列化html
    const $ = cheerio.load(html);
    // 渲染文章中的图片、视频、音频等特殊模板
    const _resources = {};
    for(let r of resources) {
      if(r.toObject) {
        r = r.toObject();
      }
      _resources[r.rid] = r;
    }
    const sourceMethods = sources[type];
    for(const name in sourceMethods) {
      if(!sourceMethods.hasOwnProperty(name)) continue;
      const method = sourceMethods[name];
      $(`[data-tag="nkcsource"][data-type="${name}"]`).replaceWith(function() {
        const dom = $(this);
        const _html = dom.toString();
        const id = dom.data().id + "";
        const resource = _resources[id];
        if(resource && !resource._rendered) {
          resource.oname = plainEscape(resource.oname || "");
          resource._rendered = true;
        }
        return method(_html, id, resource, user);
      });
    }
    html = $("body").html();

    if(type === "article") {
      // @检测
      if(atUsers && atUsers.length) {
        for(const u of atUsers) {
          const str = `@${u.username}`;
          const reg = new RegExp(str, "g");
          html = html.replace(reg, `<a href="/u/${u.uid}" target="_blank">${str}</a>`);
        }
      }
      // twemoji本地化
      html = twemoji.parse(html, {
        folder: '/2/svg',
        class: "emoji",
        attributes: () => {
          return {
            "data-tag": "nkcsource",
            "data-type": "twemoji"
          }
        },
        base: '/twemoji',
        ext: '.svg'
      });
    }

    // 过滤标签及样式
    html = htmlFilter(html);
    let id;
    if(post.pid) {
      id = `post-content-${post.pid}`;
    }
    return `<div class="render-content" id="${id}">${html}</div>`;
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
}

module.exports = new NKCRender();