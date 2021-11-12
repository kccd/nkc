const PATH = require('path');
const {deleteFile} = require('../../tools');
const {sendResourceStatusToNKC} = require('../../socket');
const storeClient = require('../../../../tools/storeClient');
const fs = require('fs');
const fsPromises = fs.promises;
const {PDFDocument} = require("pdf-lib");
const {maxGetPageScale, maxGetPageCount} = require("../../../../config/media.json").pdfPreview;
const footerJPG = fs.readFileSync(PATH.resolve(__dirname, `../../public/preview_footer.jpg`));
module.exports = async (props) => {
  const {
    file,
    data,
    storeUrl
  } = props;
  const {mediaPath, timePath, rid, ext, toc} = data;
  const filePath = file.path;
  const filenamePath = `${rid}.${ext}`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  let pdfTargetFilePath;
  let hasPreviewPDF = false;
  const storeData = [{
    filePath: filePath,
    path,
    time
  }];
  Promise.resolve()
    .then(() => {
      if(ext === 'pdf') {
        pdfTargetFilePath = filePath + `.temp_preview.${ext}`;
        const previewFilenamePath = `${rid}_preview.${ext}`;
        const previewPath = PATH.join(mediaPath, timePath, previewFilenamePath);
        return createPreviewFDF(filePath, pdfTargetFilePath, footerJPG)
          .then(() => {
            hasPreviewPDF = true;
            storeData.push({
              filePath: pdfTargetFilePath,
              path: previewPath,
              time
            });
          })
          .catch(console.error);
      }
    })
    .then(() => {
      return storeClient(storeUrl, storeData);
    })
    .then(() => {
      return sendResourceStatusToNKC({
        rid,
        status: true,
        info: {
          hasPreviewPDF
        }
      });
    })
    .catch(() => {
      return sendResourceStatusToNKC({
        rid,
        status: false,
        error: err.message || err.toString()
      });
    })
    .then(() => {
      return deleteFile(filePath);
    })
    .then(() => {
      if(pdfTargetFilePath) return deleteFile(pdfTargetFilePath);
    })
    .catch(console.error);
};

function audioToMP3(filePath, outputPath) {
  return new Promise((resolve, reject) => {
    ff(filePath)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  });
}

async function createPreviewFDF(path, outputPath, footerJPG) {
  const footerJPGBytes =  await fsPromises.readFile(footerJPG);
  const fileBuffer =      await fsPromises.readFile(path);
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
  let targetPageWidth = pages[pages.length - 1].getWidth();

  // 把尾部加上
  let pageSize = {width: targetPageWidth, height: 150}
  const jpgImage = await newPdf.embedJpg(footerJPGBytes);
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
  await fsPromises.writeFile(outputPath, newPdfBytes);
}