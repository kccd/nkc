const PATH = require("path");
const fsPromise = require("fs").promises;
const {PDFDocument} = require("pdf-lib");
const {maxGetPageScale, maxGetPageCount} = require("../../config/PDFPreview.json");



async function PDFPreviewHandler({
  // 目标pdf文件路径
  path,
  // 输出路径
  output,
  // 尾部提示pdf文件的路径
  footerJPGPath,
}) {
  const footerJpgBytes =  await fsPromise.readFile(footerJPGPath);
  const fileBuffer =      await fsPromise.readFile(path);
  const pdfDoc =          await PDFDocument.load(fileBuffer, {ignoreEncryption: true});
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

  // 获得目标pdf单页的宽度
  let targetPageWidth = pages[0].getWidth();

  // 把尾部加上
  let pageSize = {width: targetPageWidth, height: 150}
  const jpgImage = await newPdf.embedJpg(footerJpgBytes);
  const scaledSize = jpgImage.scaleToFit(pageSize.width / 3, pageSize.height / 2);
  const footerPage = newPdf.addPage([pageSize.width, pageSize.height]);
  footerPage.drawImage(jpgImage, {
    height: scaledSize.height,
    width: scaledSize.width,
    x: (pageSize.width - scaledSize.width) / 2,
    y: (pageSize.height - scaledSize.height) / 2
  })

  // 文档信息
  newPdf.setTitle("PDF");
  newPdf.setCreator("预览版PDF生成器");

  // 保存新的pdf
  const newPdfBytes = await newPdf.save();
  await fsPromise.writeFile(output, newPdfBytes);
  return true;
}

module.exports = PDFPreviewHandler;
