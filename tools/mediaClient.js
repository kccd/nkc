const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

/*
* 推送文件到存储服务
* @param {String} url 存储服务的链接
* @param {Object} fileInfo 待推送的文件信息
*   @param {String} filePath 文件磁盘路径
*   @param {String} path 文件在存储服务上的目录
*   @param {Number} time 文件上传时间戳
* */
module.exports = async (url, props) => {
  const {
    type,
    filePath,
    cover,
    storeUrl,
    data
  } = props;
  const formData = new FormData();
  if(!type) {
    throw new Error(`mediaClient: type 不能为空`);
  }
  if(!filePath) {
    throw new Error(`mediaClient: path 不能为空`);
  }
  formData.append('file', fs.createReadStream(filePath));
  if(cover) {
    formData.append('cover', cover, 'cover.png');
  }
  formData.append('type', type);
  formData.append('storeUrl', storeUrl);
  formData.append('data', JSON.stringify(data));
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'POST',
      maxBodyLength: Infinity,
      data: formData,
      headers: formData.getHeaders()
    })
      .then(res => {
        resolve(res.data || res);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
}