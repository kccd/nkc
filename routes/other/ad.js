const Router = require('koa-router');
const adRouter = new Router();
const path = require('path');
const fs = require('fs');
adRouter
  .get('/:tid', async (ctx, next) => {
    const {tid} = ctx.params;
    let url = path.resolve(__dirname, `../../resources/ad_posts/${tid}.jpg`);
    try{
      fs.accessSync(url);
    } catch(e) {
      url = path.resolve(__dirname, `../../resources/default_things/default_ad.jpg`);
    }
    ctx.filePath = url;
    await next()
  });
module.exports = adRouter;