const PATH = require('path');
const {
  deleteFile,
  getFileInfo,
  spawnProcess,
  getFileSize,
  storeClient
} = require('../../tools');
const {sendResourceStatusToNKC} = require('../../socket');
const fs = require('fs');
const fsPromises = fs.promises;
const {PDFDocument} = require("pdf-lib");
const path = require("path");
const {platform} = require("os");
const os = platform();
const linux = (os === 'linux');
const {maxGetPageScale, maxGetPageCount} = require("../../../../config/media.json").pdfPreview;
const footerJPGBytes = fs.readFileSync(PATH.resolve(__dirname, `../../public/preview_footer.jpg`));

module.exports = async (props) => {
  const {
    file,
    data,
    storeUrl
  } = props;

  const {mediaPath, timePath, rid, ext, toc, disposition} = data;
  const filePath = file.path; // 文件被推送到 media service 后的临时存储目录
  const filenamePath = `${rid}.${ext}`; // 文件在 store service 磁盘上的文件名
  const path = PATH.join(mediaPath, timePath, filenamePath); // 文件在 store service 磁盘上的路径
  const time = (new Date(toc)).getTime(); // 发送给 store service，由于区分文件所在磁盘目录

  let pdfTargetFilePath;
  let previewFilenamePath;
  let hasPreviewPDF = false;

  const storeData = [{
    filePath: filePath,
    path,
    time
  }];

  const filesInfo = {};

  Promise.resolve()
    .then(() => {
      if(ext === 'pdf') {
        return hasPassword(filePath);
      }
    })
    .then(hasPassword => {
      if(ext === 'pdf' && hasPassword) {
        throw new Error(`无法上传已加密的 PDF 文件`);
      }
    })
    .then(() => {
      if(ext === 'pdf') {
        pdfTargetFilePath = filePath + `.temp_preview.${ext}`;
        previewFilenamePath = `${rid}_preview.${ext}`;
        let miniPdfTargetFilePath = filePath + `.temp_preview_m.${ext}`;
        let previewFileSize;
        let miniPreviewFileSize;
        const previewPath = PATH.join(mediaPath, timePath, previewFilenamePath);
        return createPreviewFDF(filePath, pdfTargetFilePath) // 创建 PDF 预览文件
          .then(() => {
            return compressPDF(pdfTargetFilePath, miniPdfTargetFilePath); // 压缩 PDF 预览文件
          })
          .then(() => {
            return getFileSize(pdfTargetFilePath); // 获取压缩前的文件体积
          })
          .then(size => {
            previewFileSize = size;
            return getFileSize(miniPdfTargetFilePath); // 获取压缩后的文件体积
          })
          .then(size => {
            miniPreviewFileSize = size;
            if(miniPreviewFileSize >= previewFileSize) {
              // 压缩后文件体积反而更大
              return deleteFile(miniPdfTargetFilePath);
            } else {
              // 压缩后的文件体积更小，则删除压缩前的文件
              const oldPdfTargetFilePath = pdfTargetFilePath;
              pdfTargetFilePath = miniPdfTargetFilePath;
              return deleteFile(oldPdfTargetFilePath);
            }
          })
          .then(() => {
            hasPreviewPDF = true;
            storeData.push({
              filePath: pdfTargetFilePath,
              path: previewPath,
              time
            });
            return getFileInfo(pdfTargetFilePath);
          })
          .then(pdfFileInfo => {
            const {size, ext, hash} = pdfFileInfo;
            filesInfo.preview = {
              ext,
              size,
              hash,
              disposition,
              filename: previewFilenamePath
            };
          })
          .catch(console.error);
      }
    })
    .then(() => {
      // 推送到 store service
      return storeClient(storeUrl, storeData);
    })
    .then(() => {
      // 获取文件信息，发送给 nkc service
      return getFileInfo(filePath);
    })
    .then(fileInfo => {
      const {size, ext, hash} = fileInfo;
      filesInfo.def = {
        ext,
        size,
        hash,
        disposition,
        filename: filenamePath
      };
    })
    .then(() => {
      // 发送文件处理的状态
      return sendResourceStatusToNKC({
        rid,
        status: true,
        filesInfo
      });
    })
    .catch((err) => {
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
      return deleteFile(pdfTargetFilePath);
    })
    .catch(console.error);
};

/*
* 创建预览版 PDF
* @param {String} path 原 PDF 文件路径
* @param {String} outputPath 预览版 PDF 文件路径
* */
async function createPreviewFDF(path, outputPath) {
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


/*
* 判断 PDF 文件是否加密
* @param {String} filePath PDF 文件的路径
* @return {Boolean}
* */
async function hasPassword(filePath) {
  try {
    await spawnProcess(`qpdf`, [
      '--show-encryption',
      filePath.split(path.sep).join("/")
    ]);
  } catch (error) {
    const message = error.toString().trim();
    if(message.endsWith("No such file or directory")) {
      throw error;
    }
    return message.endsWith("invalid password");
  }
  return false;
}
/*
* 压缩 PDF 文件
* @param {String} filePath 原 PDF 文件路径
* @param {String} outputFilePath 压缩后的 PDF 文件路径
* */
async function compressPDF(filePath, outputFilePath) {
  const args = ['convert', '-colorspace', 'RGB', '-resize', '800x', '-density', '100', '-compress', 'jpeg', '-quality', '20', filePath, outputFilePath];
  if(!linux) {
    return spawnProcess('magick', args);
  }
  return spawnProcess(args.pop(), args);
}