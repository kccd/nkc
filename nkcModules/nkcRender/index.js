// const cheerio = require("./customCheerio");
const cheerio = require("cheerio");
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

const {domainWhitelistReg, urlReg} = require('../../nkcModules/regExp');


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
      // 文中的所有a标签
      const links = $("a");
      for(let i = 0; i < links.length; i++) {
        const a = links.eq(i);
        const href = a.attr("href");
        // 外链在新标签页打开
        if(href && !domainWhitelistReg.test(href)) {
          a.attr("target", "_blank");
          // 通过提示页代理外链的访问
          const url = Buffer.from(encodeURIComponent(href)).toString('base64')
          a.attr("href", "/l?t=" + url);
          // a.attr('data-type', 'nkc-url');
          // a.attr('data-url', url);
        }
      }

      // 文章中的图片
      const images = $('img');
      for(let i = 0; i < images.length; i++) {
        const image = images.eq(i);
        const src = image.attr('src');
        const reg = /^(http(s)?:\/\/|ftp:\/\/)/i;
        if(!src || !reg.test(src)) continue;
        if(domainWhitelistReg.test(src)) continue;
        image.replaceWith(`<span data-tag="nkcsource" data-type="externalImage">外链图片已失效，请作者重新上传</span>`);
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

    const body = $('body');

    if(type === 'article') {
      this.replaceATInfo($, body[0], atUsers);
      this.replaceLinkInfo($, body[0]);
    }
    html = body.html();
    if(type === "article") {
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
      id = `${post.pid}`;
    }

    if(html) {
      return `<div class="render-content math-jax" data-type="nkc-render-content" data-id="${id}">${html}</div>`;
    } else {
      return '';
    }
  }

  /* 解析字符串中的@信息
     例如: 这是前面的内容@username这是后面的内容
     输出：
     [
      {
        type: 'text',
        content: '这是前面的内容'
      },
      {
        type: 'tag',
        content: '<a href="/u/:uid" target="_blank">@username</a>'
      },
      {
        type: 'text',
        content: '这是后面的内容'
      }
    ]
  */
  extendAtByText(text, atUsers) {
    const nodes = [];
    const usersObj = {};
    const usersName = [];
    for(let i = 0; i < atUsers.length; i++) {
      const u = atUsers[i];
      let username = u.username? u.username.toLowerCase(): '';
      if(!username) continue;
      usersObj[username] = u;
      usersName.push(`@${username}`);
    }
    if(usersName.length === 0 || !text) {
      nodes.push({
        type: 'text',
        content: text
      });
    } else {
      const atReg = new RegExp(`(${usersName.join('|')})`, 'i');
      const extendNode = function(text) {
        if(!text) return;
        const result = text.match(atReg);
        if(result === null) {
          return nodes.push({
            type: 'text',
            content: text
          });
        }
        const {index} = result;
        const [targetText] = result;
        if(index > 0) {
          const beforeText = text.slice(0, index);
          nodes.push({
            type: 'text',
            content: beforeText
          });
        }
        const username = targetText.slice(1, targetText.length);
        const u = usersObj[username.toLowerCase()];
        if(!u) {
          nodes.push({
            type: 'text',
            content: targetText
          });
        } else {
          nodes.push({
            type: 'tag',
            content: `<a href="/u/${u.uid}" target="_blank">${targetText}</a>`
          });
        }
        const afterText = text.slice(index + targetText.length, text.length);
        extendNode(afterText);
      };
      extendNode(text);
    }

    if(nodes.length === 0 || (nodes.length === 1 && nodes[0].type === 'text')) {
      return [];
    } else {
      return nodes;
    }
  }

  // 处理文本中的@信息，将@+用户名改为#nkcat{uid}用于后边插入a标签
  replaceATInfo($, node, atUsers) {
    if(atUsers.length === 0 || !node.children || node.children.length === 0) return;
    for(let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      if(c.type === 'text') {
        const nodes = this.extendAtByText(c.data, atUsers);
        if(nodes.length === 0) continue;
        const container = $('<span></span>');
        for(const node of nodes) {
          const {content, type} = node;
          let nodeDom;
          if(type === 'text') {
            nodeDom = $('<span></span>');
            nodeDom.text(content);
          } else {
            nodeDom = $(content);
          }
          container.append(nodeDom);
        }
        $(c).replaceWith(container);
      } else if(c.type === 'tag') {
        if(['a', 'blockquote', 'code', 'pre'].includes(c.name)) continue;
        if(c.attribs['data-tag'] === 'nkcsource') continue;
        this.replaceATInfo($, c, atUsers);
      }
    }
  }

  // 处理所有的文本外链
  replaceLinkInfo($, node) {
    if(!node.children || node.children.length === 0) return;
    for(let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      if(c.type === 'text') {
        // 替换外链
        let oldData = c.data;
        const newData = this.replaceLink(c.data);
        if(oldData !== newData) {
          oldData = Buffer.from(encodeURIComponent(oldData)).toString('base64');
          const nodeDom = $(`<span data-type="nkc-url" data-url="${oldData}"></span>`);
          nodeDom.text(newData);
          $(c).replaceWith(nodeDom);
        }
      } else if(c.type === 'tag') {
        if(['code', 'pre'].includes(c.name)) continue;
        if(c.attribs['data-tag'] === 'nkcsource') continue;
        this.replaceLinkInfo($, c);
      }
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
    return URLifyHTML(c);
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
  replaceLink(data) {
    data = data || '';
    return data.replace(urlReg, (c) => {
      if(domainWhitelistReg.test(c)) {
        return c;
      } else {
        const arr = Array(c.length).fill('X');
        return arr.join('');
      }
    });
  }
}

module.exports = new NKCRender();
