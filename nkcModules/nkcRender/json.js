const pug = require('pug');
const path = require('path');
const tools = require('../tools');
const homePugFilePath = path.resolve(__dirname, './nodes/home.pug');
const videoSize = require('../../settings/video');

function renderHTMLByJSON(json, resourcesObj = {}) {
  const jsonObj = typeof json === 'string' ? JSON.parse(json) : json;
  const html = pug.renderFile(homePugFilePath, {
    pretty: true,
    data: jsonObj,
    tools: tools,
    resourcesObj,
    videoQuality: videoSize,
    cache: false,
  });

  return html;
}

module.exports = {
  renderHTMLByJSON,
};
