/*
* @param {File} file 文件对象
* @param {Object} resource 资源对象
* */
const FILE = require("../../../nkcModules/file");
const PATH = require('path');
const fs = require('fs');
const fsPromise = fs.promises;
const {PDFDocument} = require("pdf-lib");

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
    await makePDFPreviewPart({
      path: targetFilePath,
      output: pdfPreviewPath
    });
  }
}

// 生成预览版pdf要使用到的尾部
const endTipPDFBuffer = fs.readFileSync(PATH.resolve(__dirname, '../../../public/default/preview_footer.pdf'), {flag: 'r'});

async function makePDFPreviewPart({
    path,
    output
}) {
    const endPdfDoc = await PDFDocument.load(endTipPDFBuffer);
    const fileBuffer = await fsPromise.readFile(path);
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pageCount = pdfDoc.getPageCount();

    // 新建一个pdf
    const newPdf = await PDFDocument.create();
    let pages;
    if(pageCount > 2) {
        pages = await newPdf.copyPages(pdfDoc, [0, 1]);
    } else {
        pages = await newPdf.copyPages(pdfDoc, [0]);
    }
    pages.map(page => newPdf.addPage(page));

    // 把尾部加上
    const [endPage] = await newPdf.copyPages(endPdfDoc, [0]);
    newPdf.addPage(endPage);

    // 保存新的pdf
    const newPdfBytes = await newPdf.save();
    await fsPromise.writeFile(output, newPdfBytes);
}
