/*
* @param {File} file 文件对象
* @param {Object} resource 资源对象
* */
const FILE = require("../../../nkcModules/file");
const PATH = require('path');
const fs = require('fs');
const fsPromise = fs.promises;
const PDFPreviewFileWorker = require("../../../tools/PDFPreviewFileMaker");

const pdfPreviewWorker = new PDFPreviewFileWorker();

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
  // 如果是pdf就再生成一个预览版
  if(ext.toLowerCase() === "pdf") {
    let pdfPreviewPath = PATH.resolve(fileFolder, `./${rid}_preview.${ext}`);
    // console.log("预览版pdf生成到:", pdfPreviewPath);
    pdfPreviewWorker.makeFile({
      path: targetFilePath,
      output: pdfPreviewPath,
      footerPDFPath: PATH.resolve(__dirname, "../../../public/default/preview_footer.pdf")
    })
  }
}