const HTTP = require('http');
const logger = require('../nkcModules/logger');
const HTTPS = require('https');
const PATH = require('path');
const mime = require('mime');
const ContentDisposition = require('content-disposition');
const FILE = require('../nkcModules/file');
const fs = require('fs');
const upload = require('../settings/upload');

module.exports = async (url) => {
  return new Promise((resolve, reject) => {
    let http;
    if (url.indexOf('https://') === 0) {
      http = HTTPS;
    } else if (url.indexOf('http://') === 0) {
      http = HTTP;
    } else {
      return reject(new Error('未知的请求协议'));
    }
    http
      .get(
        url,
        {
          timeout: 2 * 60 * 1000,
        },
        (res) => {
          try {
            const { statusCode, headers } = res;
            if (statusCode !== 200) {
              return reject(new Error(`文件下载失败`));
            }
            const contentLength = headers['content-length'];
            if (contentLength > 50 * 1024 * 1024) {
              return reject(new Error(`文件超过50MB，无法下载`));
            }
            const chunks = [];
            let size = 0;
            res.on('data', (chunk) => {
              chunks.push(chunk);
              size += chunk.length;
            });
            res.on('end', () => {
              let extension;
              try {
                const contentDisposition = ContentDisposition.parse(
                  headers['content-disposition'] || '',
                );
                const filename = contentDisposition.parameters.filename;
                extension = PATH.extname(filename);
              } catch (err) {
                logger.error(err);
              }
              if (!extension) {
                let ext = mime.getExtension(headers['content-type'] || '');
                if (ext) {
                  extension = '.' + ext;
                }
              }
              if (!extension) {
                extension = PATH.extname(url);
              }
              if (!extension) {
                extension = '.jpg';
              }
              const filename = `upload_downloader_${Date.now()}_${Math.ceil(
                Math.random() * 100000000,
              )}${extension}`;
              const filePath = PATH.resolve(upload.uploadDir, `./${filename}`);
              fs.writeFile(
                filePath,
                Buffer.concat(chunks, size),
                'binary',
                (err) => {
                  if (err) {
                    return reject(err);
                  }
                  FILE.getFileObjectByFilePath(filePath)
                    .then((d) => {
                      resolve(d);
                    })
                    .catch(reject);
                },
              );
            });
          } catch (err) {
            reject(err);
          }
        },
      )
      .on('error', (err) => {
        reject(err);
      });
  });
};
