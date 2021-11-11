const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

/*
* 推送文件到存储服务
* @param {String} url 存储服务的链接
* @param {[Object]} files 待推送的文件信息
*   @param {String} filePath 文件磁盘路径
*   @param {String} path 文件在存储服务上的目录
*   @param {Number} time 文件上传时间戳
* */
module.exports = async (url, files = []) => {
  if(!Array.isArray(files)) {
    files = [files];
  }
  const formData = new FormData();
  const filesInfo = {};
  for(let i = 0; i < files.length; i++) {
    const {filePath, path, time} = files[i];
    const key = `file_${i}`;
    filesInfo[key] = {
      path,
      time
    };
    formData.append(key, fs.createReadStream(filePath));
  }
  formData.append('filesInfo', JSON.stringify(filesInfo));
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'POST',
      maxBodyLength: Infinity,
      data: formData,
      headers: formData.getHeaders()
    })
      .then(resolve)
      .catch(reject);
  });
}