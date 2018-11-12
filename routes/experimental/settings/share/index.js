const Router = require('koa-router');
const shareRouter = new Router();
shareRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const shareLimit = await db.ShareLimitModel.findOne({"shareType":"all"});
    if(!shareLimit){
      const newLimit = new db.ShareLimitModel({});
      await newLimit.save();
    }
    const from = ctx.request.get('FROM');
    if(from !== 'nkcAPI') {
      ctx.template = 'experimental/settings/share.pug';
      return await next();
    }
    data.shareLimit = await db.ShareLimitModel.findOne({"shareType":"all"});
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {body, db} = ctx;
    const {shareLimit} = body;
    await db.ShareLimitModel.update({"shareType": "all"}, {
      $set: {
        shareLimitTime: shareLimit.shareLimitTime,
        shareLimitCount: shareLimit.shareLimitCount
      }
    })
    await next();
  });
module.exports = shareRouter;