const rateLimit = require('koa-ratelimit');
const redisClientCache = require('../settings/redisClientCache');
const fs = require('fs');
const redis = require('ioredis');
const path = require('path');
const rateLimitErrorInfo = fs.readFileSync(path.resolve(__dirname, `../pages/error/429.html`));
const {files: fileOperations} = require('../settings/operationsType');
const {
  total: rateLimitTotal, // 总限制 包含：静态资源、图片、视频、音频、附件、html以及json
  totalFile: rateLimitTotalFile, // 总的文件限制 包含：图片、视频、音频以及附件
  totalHtml: rateLimitTotalHtml, // 总的除附件以外的限制 包含：html和json
  userFile: rateLimitUserFile, // 同IP文件限制 包含：图片、视频、音频以及附件
  userHtml: rateLimitUserHtml, // 同IP除附件以外的限制 包含：html和json
} = require('../config/rateLimit.json');
module.exports = {
  total: rateLimit({
    db: new redis(),
    duration: rateLimitTotal[0],
    disableHeader: false,
    errorMessage: rateLimitErrorInfo,
    id: (ctx) => {
      return 'rl:all';
    },
    max: rateLimitTotal[1]
  }),
  totalFile: rateLimit({
    db: new redis(),
    duration: rateLimitTotalFile[0],
    disableHeader: false,
    errorMessage: rateLimitErrorInfo,
    id: (ctx) => {
      return 'rl:file';
    },
    max: rateLimitTotalFile[1],
    whitelist: (ctx) => {
      return !fileOperations.includes(ctx.data.operationId);
    }
  }),
  totalHtml: rateLimit({
    db: new redis(),
    duration: rateLimitTotalHtml[0],
    disableHeader: false,
    errorMessage: rateLimitErrorInfo,
    id: (ctx) => {
      return 'rl:html';
    },
    max: rateLimitTotalHtml[1],
    whitelist: (ctx) => {
      return fileOperations.includes(ctx.data.operationId);
    }
  }),
  userFile: rateLimit({
    db: new redis(),
    duration: rateLimitUserFile[0],
    disableHeader: false,
    errorMessage: rateLimitErrorInfo,
    id: (ctx) => {
      return `rl:ip:file:${ctx.address}`;
    },
    max: rateLimitUserFile[1],
    whitelist: (ctx) => {
      return !fileOperations.includes(ctx.data.operationId);
    }
  }),
  userHtml: rateLimit({
    db: new redis(),
    duration: rateLimitUserHtml[0],
    disableHeader: false,
    errorMessage: rateLimitErrorInfo,
    id: (ctx) => {
      ctx.set('content-type', 'text/html');
      return `rl:ip:html:${ctx.address}`;
    },
    max: rateLimitUserHtml[1],
    whitelist: (ctx) => {
      return fileOperations.includes(ctx.data.operationId);
    }
  }),
}
