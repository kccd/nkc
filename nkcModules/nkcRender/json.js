const pug = require('pug');
const path = require('path');
const homePugFilePath = path.resolve(__dirname, './nodes/home.pug');

function renderHTMLByJSON(json) {
  const jsonObj = JSON.parse(json);
  const html = pug.renderFile(homePugFilePath, {
    pretty: true,
    data: jsonObj,
    cache: false,
  });

  return html;
}

module.exports = {
  renderHTMLByJSON,
};
