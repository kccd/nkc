const qr = require('qr-image');
const Router = require('koa-router');
const qrCodeRouter = new Router();
const {upload} = require('../../settings');
const {qrCodePath} = upload;
qrCodeRouter
  .get('/:tid', async (ctx, next) => {
    const {tid} = ctx.params;
    const {fs} = ctx;
    if(!await fs.exists(qrCodePath)) {
      try {
        await fs.mkdir(qrCodePath);
      } catch (e) {
        ctx.throw(500, `生成二维码目录出错：${e}`);
      }
    }
    const url = `${qrCodePath}/${tid}.png`;
    try {
      await fs.access(url);
    } catch (e) {
      const qrUrl = ctx.origin + '/t/' + tid;
      const code = qr.imageSync(qrUrl, {type: 'png', margin: 1});
      await fs.writeFile(url, code);
    }
    ctx.filePath = url;
    await next();
  });
module.exports = qrCodeRouter;