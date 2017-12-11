const qr = require('qr-image');
const Router = require('koa-router');
const qrCodeRouter = new Router();
const settings = require('../../settings/upload');
const {qrCodePath} = settings;
const path = require('path');
const fs = require('fs');
qrCodeRouter
  .get('/:tid', async (ctx, next) => {
    const {tid} = ctx.params;
    if(!fs.existsSync(qrCodePath)) {
      try {
        fs.mkdirSync(qrCodePath);
      } catch (e) {
        ctx.throw(500, `生成二维码目录出错：${e}`);
      }
    }
    const url = `${qrCodePath}/${tid}.png`;
    try {
      fs.accessSync(url);
    } catch (e) {
      const qrUrl = ctx.origin + '/t/' + tid;
      const code = qr.imageSync(qrUrl, {type: 'png', margin: 1});
      fs.writeFileSync(url, code);
    }
    ctx.filePath = url;
    await next();
  });
module.exports = qrCodeRouter;