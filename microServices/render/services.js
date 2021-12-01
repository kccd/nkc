const pug = require('pug');
function renderPug(pugFilePath, state, data) {
  return pug.renderFile(pugFilePath, {
    state,
    data,
    cache: process.env.NODE_ENV === 'production'
  });
}

module.exports = {
  renderPug
}