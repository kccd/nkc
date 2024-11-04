const pug = require('pug');
const path = require('path');
const tools = require('../tools');
const homePugFilePath = path.resolve(__dirname, './nodes/home.pug');
const videoSize = require('../../settings/video');

function renderHTMLByJSON({ json, resources = [], xsf = 0 }) {
  const jsonObj = typeof json === 'string' ? JSON.parse(json) : json;
  const resourcesObj = {};
  for (let r of resources) {
    if (r.toObject) {
      r = r.toObject();
    }
    resourcesObj[r.rid] = r;
  }
  const html = pug.renderFile(homePugFilePath, {
    pretty: true,
    data: jsonObj,
    tools: tools,
    resourcesObj,
    videoQuality: videoSize,
    xsf,
    cache: false,
  });

  return html;
}

module.exports = {
  renderHTMLByJSON,
};
