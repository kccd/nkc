const HTTP = require('http');
const HTTPS = require('https');
const PATH = require('path');
const FILE = require('../nkcModules/file');
const fs = require('fs');
const upload = require('../settings/upload');

module.exports = async (url) => {
  let http;
  if(url.indexOf('https://') === 0) {
    http = HTTPS;
  } else if(url.indexOf('http://') === 0) {
    http = HTTP;
  }
  return new Promise((resolve, reject) => {
    http.get(url, {
      timeout: 2 * 60 * 1000
    }, (res) => {
      try{
        const {statusCode, headers} = res;
        if(statusCode !== 200) return reject(new Error(`文件下载失败`));
        const contentLength = headers['content-length'];
        if(contentLength > 50 * 1024 * 1024) return reject(new Error(`文件超过50MB，无法下载`));
        let data = '';
        res.setEncoding('binary');
        res.on('data', (d) => {
          data += d;
        });
        res.on('end', () => {
          let filename = headers['content-disposition'] || '';
          filename = filename.match(/filename=(.+?);/);
          if(filename) {
            filename = filename[1];
          } else {
            filename = url;
          }
          const ext = PATH.extname(filename);
          filename = `upload_downloader_${Date.now()}_${Math.ceil(Math.random() * 100000000)}${ext}`;
          const filePath = PATH.resolve(upload.uploadDir, `./${filename}`);
          fs.writeFile(filePath, data, 'binary', (err) => {
            if(err) return reject(err);
            FILE.getFileObjectByFilePath(filePath)
              .then(d => {
                resolve(d);
              })
              .catch(reject);
          });
        });
      } catch(err) {
        reject(err);
      }
    })
      .on('error', err => {
        reject(err);
      });
  });
};
