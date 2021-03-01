const cheerio = require("./customCheerio");
const htmlFilter = require("./htmlFilter");
const markNotes = require("./markNotes");
const twemoji = require("twemoji");
const plainEscape = require("../plainEscaper");
const URLifyHTML = require("../URLifyHTML");
const fs = require("fs");
const path = require("path");
const filePath = path.resolve(__dirname, "./sources");
const files = fs.readdirSync(filePath);
const sources = {};
for(const filename of files) {
  const name = filename.split(".")[0];
  sources[name] = require(filePath + `/${name}`);
}
const serverConfig = require("../../config/server");
const linkReg = new RegExp(`^` +
  serverConfig.domain
    .replace(/\//g, "\\/")
    .replace(/\./g, "\\.")
  + "|^\/"
  , "i");
class NKCRender {
  constructor() {
    this.htmlFilter = htmlFilter;
    this.markNotes = markNotes;
  }
  renderHTML(options) {
    // 渲染html
    // <nkcsource></nkcsource>模板解析
    // 学术分判断
    const self = this;
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
    if(type === "article") {
      // 外链在新标签页打开
      const links = $("a[target!='_blank']");
      for(let i = 0; i < links.length; i++) {
        const a = links.eq(i);
        const href = a.attr("href");
        if(!linkReg.test(href)) {
          a.attr("target", "_blank");
        }
      }
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
          resource.oname = self.plainEscape(resource.oname || "");
          resource._rendered = true;
        }
        return method(_html, id, resource, user);
      });
    }

    // 处理文本中的@信息，将@+用户名改为#nkcat{uid}用于后边插入a标签
    const replaceATInfo = function(node, atUsers) {
      if(!node.children || node.children.length === 0) return;
      for(let i = 0; i < node.children.length; i++) {
        const c = node.children[i];
        if(c.type === 'text') {
          for(const atUser of atUsers) {
            const str = `@${atUser.username}`;
            const strLowerCase = str.toLowerCase();
            c.data = c.data.replace(new RegExp(str, 'ig'), `#nkcat{${atUser.uid}}`);
            c.data = c.data.replace(new RegExp(strLowerCase, 'ig'), `#nkcat{${atUser.uid}}`);
          }
        } else if(c.type === 'tag') {
          if(['a', 'blockquote', 'code', 'pre'].includes(c.name)) continue;
          if(c.attribs['data-tag'] === 'nkcsource') continue;
          replaceATInfo(c, atUsers);
        }
      }
    }

    const body = $('body');

    if(type === 'article') {
      replaceATInfo(body[0], atUsers);
    }
    html = body.safeHtml();
    if(type === "article") {
      // 将#nkcat{uid}替换成a标签
      if(atUsers && atUsers.length) {
        for(const u of atUsers) {
          html = html.replace(
            new RegExp(`#nkcat\\{${u.uid}}`, 'ig'),
            `<a href="/u/${u.uid}" target="_blank" data-tag="nkcsource" data-type="at">@${u.username}</a>`
          );
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
    if(html) {
      return `<div class="render-content math-jax" id="${id}">${html}</div>`;
    } else {
      return '';
    }
  }
  encodeRFC5987ValueChars(str) {
    return encodeURIComponent(str).
      // 注意，仅管 RFC3986 保留 "!"，但 RFC5987 并没有
      // 所以我们并不需要过滤它
      replace(/['()]/g, (c) => {
        if(c === "'") {
          return '%27';
        } else if(c === '(') {
          return '%28';
        } else {
          return '%29';
        }
      }). // i.e., %27 %28 %29
      replace(/\*/g, '%2A');
      // 下面的并不是 RFC5987 中 URI 编码必须的
      // 所以对于 |`^ 这3个字符我们可以稍稍提高一点可读性
      // replace(/%(?:7C|60|5E)/g, unescape);
  }
  plainEscape(c) {
    c = plainEscape(c);
    return htmlFilter(c);
  }
  URLifyHTML(c) {
    c = URLifyHTML(c);
    return htmlFilter(c);
  }
  htmlToPlain(html = "", count) {
    const $ = cheerio.load(html);
    $(`[data-tag="nkcsource"]`).remove();
    let text = $.text();
    const textLength = text.length;
    text = text.slice(0, count);
    if(count < textLength) text += "...";
    return text;
  }
}

module.exports = new NKCRender();
