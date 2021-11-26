const PATH = require('path');
const fs = require("fs");
const fsPromises = fs.promises;
const {getTargetFilePath, clearMetadata, accessFile} = require('../tools')
module.exports = async (ctx, next) => {
  const {query, data} = ctx;
  const files = JSON.parse(query.files);
  for(const file of files) {
    const {path, type, time, ext} = file;
    const filePath = await getTargetFilePath(Number(time), path);
    const tempPath = filePath + `_temp.${ext}`;
    if (!(await accessFile(filePath))) ctx.throw(400, '文件找不到');
    await clearMetadata(filePath, tempPath);
    //重命名文件
    await fsPromises.rename(tempPath, filePath);
  }
  await next();
}