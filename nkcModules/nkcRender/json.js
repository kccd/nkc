const pug = require('pug');
const path = require('path');
const tools = require('../tools');
const homePugFilePath = path.resolve(__dirname, './nodes/home.pug');
const videoSize = require('../../settings/video');
const { domainWhitelistReg, urlReg } = require('../../nkcModules/regExp');
const { replaceEmojiWithImgTags } = require('../fluentuiEmoji');
const plain_escape = require('../plainEscaper');

function renderHTMLByJSON({
  json,
  resources = [],
  xsf = 0,
  atUsers = [],
  pid = '',
}) {
  const jsonObj = typeof json === 'string' ? JSON.parse(json) : json;
  const resourcesObj = {};
  for (let r of resources) {
    if (r.toObject) {
      r = r.toObject();
      // r.oname = plain_escape(r.oname || '');
    }
    resourcesObj[r.rid] = r;
  }
  let html = pug.renderFile(homePugFilePath, {
    pretty: true,
    data: jsonObj,
    pid,
    tools: tools,
    resourcesObj,
    videoQuality: videoSize,
    xsf,
    domainWhitelistReg,
    atUsers,
    urlReg,
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
