const router = require('koa-router')();

router
  .use('/', async (ctx, next) => {
    const {data, db, params} = ctx;
    const {pid} = params;
    const post = await db.PostModel.findOnly({pid});
    data.comment = post.comment;
    await next();
  })
  .get('/', async (ctx, next) => {
    await next();
  })
  .post('/', async (ctx, next) => {
    const {body, db, params} = ctx;
    const {comment} = body;
    const {pid} = params;
    if(!['r', 'rw', 'n'].includes(comment)) {
      ctx.throw(400, `参数错误 comment: ${comment}`);
    }
    await db.PostModel.updateOne({pid}, {
      $set: {
        comment
      }
    });
    await next();
  });

module.exports = router;
