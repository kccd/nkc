const pug = require('pug');
const path = require('path');
const tools = require('../tools');
const homePugFilePath = path.resolve(__dirname, './nodes/home.pug');

function renderHTMLByJSON(json) {
  const jsonObj = typeof json === 'string' ? JSON.parse(json) : json;
  const html = pug.renderFile(homePugFilePath, {
    pretty: true,
    data: jsonObj,
    tools: tools,
    cache: false,
  });

  return html;
}

module.exports = {
  renderHTMLByJSON,
};
