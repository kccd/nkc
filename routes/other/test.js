const testRouter = require('koa-router')();
testRouter
  .get('/', async (ctx, next) => {
    ctx.template = "test/test.pug";
    await next();
  })
  .get("/demo", async (ctx, next) => {
    ctx.template = "demo/index.pug";
    await next();
  })
  .get('/file', async (ctx, next) => {
    ctx.remoteFile = {
      url: 'http://192.168.11.250:10292',
      query: {
        time: new Date(`2021-11-10 00:00:00`),
        path: 'resource/video/2021/11/29486.mp4'
      },
      isAttachment: false,
      filename: 'success.mp4',
    };
    await next();
  });

module.exports = testRouter;
