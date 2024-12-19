const pug = require('pug');
const {
  highlightLanguages,
  highlightLanguagesObject,
} = require('../../nkcModules/highlightLanguages.js');
const path = require('path');
const tools = require('../tools');
const homePugFilePath = path.resolve(__dirname, './nodes/home.pug');
const videoSize = require('../../settings/video');
const { domainWhitelistReg, urlReg } = require('../../nkcModules/regExp');
const { replaceEmojiWithImgTags } = require('../fluentuiEmoji');
const { plainEscape } = require('.');

function renderHTMLByJSON({
  json,
  resources = [],
  xsf = 0,
  atUsers = [],
  pid = '',
  source = 'post',
  sid = '',
}) {
  if (!json) {
    json = {
      type: 'doc',
      content: [
        { type: 'paragraph', attrs: { textAlign: 'left', textIndent: 0 } },
      ],
    };
  }
  if (source === 'post') {
    sid = pid;
  }
  let jsonObj = '';
  if (typeof json === 'string') {
    try {
      jsonObj = JSON.parse(json);
    } catch (err) {
      // console.log(err);
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
                text: `数据：${json}`,
              },
            ],
          },
        ],
      };
    }
  } else {
    jsonObj = json;
  }
  const resourcesObj = {};
  for (let r of resources) {
    if (r.toObject && !r._rendered) {
      r = r.toObject();
      r.oname = plainEscape(r.oname || '');
      r._rendered = true;
    }
    resourcesObj[r.rid] = r;
  }
  let html = pug.renderFile(homePugFilePath, {
    pretty: false,
    data: jsonObj,
    pid,
    source,
    sid,
    tools: tools,
    resourcesObj,
    videoQuality: videoSize,
    xsf,
    domainWhitelistReg,
    atUsers,
    urlReg,
    highlightLanguages,
    highlightLanguagesObject,
    cache: false,
  });

  html = replaceEmojiWithImgTags(html);
  // 对于复选框以及其他内容暂时不支持直接过滤
  // html = htmlFilter(html);
  return html;
}

module.exports = {
  renderHTMLByJSON,
};
