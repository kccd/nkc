const fs = require("fs");
const fsPromises = fs.promises;
const {getTargetFilePath, clearMetadata, accessFile, getFileInfo} = require('../tools')
module.exports = async (ctx, next) => {
  const {query} = ctx;
  const files = JSON.parse(query.files);
  for(const file of files) {
    const {path, time} = file;
    const filePath = await getTargetFilePath(Number(time), path);
    const {ext} = await getFileInfo(filePath);
    const tempPath = filePath + `_temp.${ext}`;
    if (!(await accessFile(filePath))) ctx.throw(400, '文件找不到');
    await clearMetadata(filePath, tempPath);
    //重命名文件
    await fsPromises.rename(tempPath, filePath);
  }
  await next();
}