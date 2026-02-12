const router = require('koa-router')();
const md5Router = require('./md5');
const { Public } = require('../../middlewares/permission');
const chunkRouter = require('./chunk');
router
  .get('/', Public(), async (ctx, next) => {
    const { db, data, query } = ctx;
    let { type, rid } = query;
    rid = rid.split('-');
    const q = {
      rid: { $in: rid },
    };
    if (type === 'toLibrary') {
      q.mediaType = 'mediaAttachment';
    }
    data.resources = await db.ResourceModel.find({ rid: { $in: rid } });
    await next();
  })
  .use('/chunk', chunkRouter.routes(), chunkRouter.allowedMethods())
  .use('/md5', md5Router.routes(), md5Router.allowedMethods());
module.exports = router;
