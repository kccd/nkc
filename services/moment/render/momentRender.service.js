const pug = require('pug');
const cheerio = require('cheerio');
const xss = require('xss');
const path = require('path');
const tools = require('../../../nkcModules/tools');
const homePugFilePath = path.resolve(__dirname, './nodes/home.pug');
const DocumentModel = require('../../../dataModels/DocumentModel');
const {
  replaceLinksWithATags,
  replaceHTMLExternalLink,
  renderAtUsers,
} = require('../../../nkcModules/html');
class MomentRenderService {
  filterMomentSimpleHTML(html) {
    return xss(html, {
      whiteList: {
        a: ['href', 'target'],
        span: ['style'],
        img: ['src', 'class', 'alt'],
        div: [],
        p: [],
      },
      onTagAttr: function (tag, name, value, isWhiteAttr) {
        if (isWhiteAttr) {
          if (tag === 'a' && name === 'href') {
            const valueHandled = value.replace('javascript:', '');
            return `href=${valueHandled}`;
          }
        }
      },
      css: {
        whiteList: {
          'white-space': true,
        },
      },
    });
  }

  renderingSimpleJson(props) {
    const { content = '', atUsers = [], removeEmptyParagraphs = false } = props;
    // 如果内容为空字符串，则直接返回空字符串
    if (!content) {
      return '';
    }
    let jsonObj;
    // 尝试解析JSON字符串
    // 如果解析失败，则返回一个符合tiptap规则且包含错误信息的JSON对象
    try {
      jsonObj = JSON.parse(content);
    } catch (err) {
      console.log(err);
      jsonObj = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `JSON解析错误：${err.message}`,
              },
            ],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: `数据：${content}`,
              },
            ],
          },
        ],
      };
    }
    // 调用pug模板引擎渲染JSON对象
    let html = pug.renderFile(homePugFilePath, {
      pretty: true,
      data: jsonObj,
      tools,
      cache: false,
    });
    if (removeEmptyParagraphs) {
      // 在这里移除空的p标签
      const $ = cheerio.load(html);
      $('p').each(function () {
        const text = $(this).text().trim();
        const isEmpty = !text || text === '\n';
        if (isEmpty) {
          $(this).remove();
        }
      });
      html = $.html();
    }

    // 识别文本链接，将其替换为a标签
    html = replaceLinksWithATags(html);
    // 处理AT功能，识别@符号，然后将@符号后的用户名识别出来，然后将其替换为a标签
    html = renderAtUsers(html, atUsers);
    // 处理html中href只想外部链接的a标签，将href替换为/l?t=urlBase64
    html = replaceHTMLExternalLink(html);
    // 过滤html，只允许白名单中的标签和属性
    html = this.filterMomentSimpleHTML(html);
    return html;
  }
}

module.exports = {
  momentRenderService: new MomentRenderService(),
};
