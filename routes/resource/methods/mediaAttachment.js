/*
* @param {File} file 文件对象
* @param {Object} resource 资源对象
* */
const FILE = require("../../../nkcModules/file");
const PATH = require('path');
const fsPromise = require('fs').promises;
module.exports = async (options) => {
  const {file, resource} = options;
  const {path} = file;
  const {rid, toc, ext} = resource;
  const fileFolder = await FILE.getPath('mediaAttachment', toc);
  const targetFilePath = PATH.resolve(fileFolder, `./${rid}.${ext}`);
  await fsPromise.copyFile(path, targetFilePath);
  await resource.update({
    state: 'usable'
  });
}
