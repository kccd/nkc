const fs = require('fs');
const fsPromises = fs.promises;
/*
* 判断文件是否存在
* */
async function accessFile(targetPath) {
  try{
    await fsPromises.access(targetPath);
    return true;
  } catch(err) {
    return false;
  }
}

module.exports = {
  accessFile
}