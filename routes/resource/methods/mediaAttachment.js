/*
* @param {File} file 文件对象
* @param {Object} resource 资源对象
* */
const FILE = require("../../../nkcModules/file");
const PATH = require('path');
const fs = require('fs');
const fsPromise = fs.promises;
const PDFPreviewFileWorker = require("../../../tools/PDFPreviewFileMaker");
const statics = require('../../../settings/statics');
const pdfPreviewWorker = new PDFPreviewFileWorker();
const imageMagick = require('../../../tools/imageMagick');
const {isWithPassword} = require("../../../tools/qpdf");

module.exports = async (options) => {
  const {file, resource} = options;
  const {path} = file;
  const {rid, toc, ext} = resource;
  const fileFolder = await FILE.getPath('mediaAttachment', toc);
  const targetFilePath = PATH.resolve(fileFolder, `./${rid}.${ext}`);
  if(ext.toLowerCase() === "pdf" && isWithPassword(path)) {
    throw new Error("不能上传带密码的PDF文件");
  }
  await fsPromise.copyFile(path, targetFilePath);
  await resource.updateOne({
    state: 'usable'
  });
  // 如果是pdf就再生成一个预览版
  if(ext.toLowerCase() === "pdf") {
    let pdfPreviewPath = PATH.resolve(fileFolder, `./${rid}_preview.${ext}`);
    let pdfPreviewPathMini = PATH.resolve(fileFolder, `./${rid}_preview_mini.${ext}`);
    // console.log("预览版pdf生成到:", pdfPreviewPath);
    const {error} = await pdfPreviewWorker.makeFile({
      path: targetFilePath,
      output: pdfPreviewPath,
      footerJPGPath: statics.defaultPreviewJPG
    });
    if(error) {
      throw error;
    } else {
      await imageMagick.compressPDF(pdfPreviewPath, pdfPreviewPathMini);
    }
    const previewFile = await fsPromise.stat(pdfPreviewPath);
    const previewFileMini = await fsPromise.stat(pdfPreviewPathMini);
    if(previewFileMini.size > previewFile.size) {
      // 压缩后体积更大 则保留未压缩文件
      await fsPromise.unlink(pdfPreviewPathMini);
    } else {
      // 压缩后体积更小 保留压缩文件
      await fsPromise.unlink(pdfPreviewPath);
      await fsPromise.rename(pdfPreviewPathMini, pdfPreviewPath);
    }
  }
}
