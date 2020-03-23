const fs = require("fs");
const crypto = require("crypto");
const func = {};
/* 
  获取文件的md5
  @param {String} path 文件路径
  @return {String} md5
  @author pengxiguaa 2019-10-31
*/
func.getFileMD5 = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.access(filePath, err => {
      try{
        if(err) throw err;
        const stream = fs.createReadStream(filePath);
        const hmac = crypto.createHash("md5");
        stream.on("data", (chunk) => {
          hmac.update(chunk);
        });
        stream.on("end", () => {
          resolve(hmac.digest("hex"));
        });
        stream.on("error", err => {
          reject(err);
        });
      } catch(err) {
        reject(err);
      }
    });
  });
};

/*
* 获取一段文本的md5
* @param {String} text 文本内容
* @return {String} md5
* @author pengxiguaa 2020-3-10
* */
func.getTextMD5 = async (text) => {
  const c = crypto.createHash("md5");
  c.update(text);
  return c.digest("hex");
};
module.exports = func;