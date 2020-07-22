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
    data.shareLimit = await db.ShareLimitModel.find({});
    await next();
  })
  .put('/', async (ctx, next) => {
    const {body, db} = ctx;
    const {shareLimit} = body;
    for(var i in shareLimit){
      if(shareLimit[i]._id){
        await db.ShareLimitModel.update({"shareType": shareLimit[i].shareType}, {
          $set: {
            shareLimitTime: shareLimit[i].shareLimitTime,
            shareLimitCount: shareLimit[i].shareLimitCount
          }
        })
      }else{
        const newLimit = new db.ShareLimitModel({
          shareName: shareLimit[i].shareName,
          shareType: shareLimit[i].shareType,
          shareLimitTime: shareLimit[i].shareLimitTime,
          shareLimitCount: shareLimit[i].shareLimitCount
        });
        await newLimit.save();
      }
    }
    await next();
  });
module.exports = shareRouter;
