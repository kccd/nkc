const Router = require('koa-router');
const router = new Router();
const rollback = require('./rollback');

router
  .get('/', async(ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    if(!(await targetPost.ensurePermission(ctx))) ctx.throw(403,'权限不足');
    if(data.userLevel < 3) ctx.throw(403,'权限不足');
    data.post = targetPost;
    data.histories = await db.HistoriesModel.find({pid}).sort({tlm: -1});
    data.targetUser = await targetPost.extendUser();
    ctx.template = 'interface_post_history.pug';
    await next();
  })
  .use('/rollback', rollback.routes(), rollback.allowedMethods());

module.exports = router;