const fsPromise = require("fs").promises;
const {PDFDocument} = require("pdf-lib");
const {maxGetPageScale, maxGetPageCount} = require("../../config/PDFPreview.json");

async function PDFPreviewHandler({
  // 目标pdf文件路径
  path,
  // 输出路径
  output,
  // 尾部提示pdf文件的路径
  footerPDFPath,

}) {
  const fileBuffer =      await fsPromise.readFile(path);
  const footerPDFBuffer = await fsPromise.readFile(footerPDFPath);
  const pdfDoc =          await PDFDocument.load(fileBuffer, {ignoreEncryption: true});
  const endPdfDoc =       await PDFDocument.load(footerPDFBuffer, {ignoreEncryption: true});
  const pageCount =       pdfDoc.getPageCount();

  // 新建一个pdf
  const newPdf = await PDFDocument.create();
  // 这里是要取走的页
  let pages;
  if(pageCount === 1) {
    pages = await newPdf.copyPages(pdfDoc, [0]);
  } else {
    let shouldGetPageCount = Math.floor(pageCount * maxGetPageScale);
    if(shouldGetPageCount < maxGetPageCount) {
      pages = await newPdf.copyPages(pdfDoc, Array.from({length: shouldGetPageCount}, (v, k) => k));
    } else {
      pages = await newPdf.copyPages(pdfDoc, Array.from({length: 8}, (v, k) => k));
    }
  }
  pages.map(page => newPdf.addPage(page));

  // 把尾部加上
  const [endPage] = await newPdf.copyPages(endPdfDoc, [0]);
  newPdf.addPage(endPage);

  // 保存新的pdf
  const newPdfBytes = await newPdf.save();
  await fsPromise.writeFile(output, newPdfBytes);
  return true;
}

module.exports = PDFPreviewHandler;
