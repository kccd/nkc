const pug = require('pug');
const PATH = require('path');
const {root} = require('../../config/render.json');
const {accessFile} = require('./tools');

function isIncluded(data, name) {
  if(data[name]) return true;
  data[name] = true;
  return false;
}

function objToStr(obj) {
  return encodeURIComponent(JSON.stringify(obj));
}

async function renderPug(templatePath, remoteState, data) {
  templatePath = PATH.resolve(root, templatePath);
  if(!await accessFile(templatePath)) {
    throw new Error(`Pug 模板不存在 path: ${templatePath}`);
  }
  const includedModules = {};
  return pug.renderFile(templatePath, {
    remoteState,
    data,
    cache: process.env.NODE_ENV === 'production',
    isIncluded: (name) => {
      return isIncluded(includedModules, name);
    },
    objToStr,
  });
}

module.exports = {
  renderPug
}