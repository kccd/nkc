const Router = require('koa-router');
const router = new Router();

router
  .patch('/', async (ctx, next) => {
    const {disabled} = ctx.body;
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const {PostModel} = db;
    const {user} = data;
    if(disabled === undefined) ctx.throw(400, '参数不正确');
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    if(!await targetThread.ensurePermissionOfModerators(ctx)) ctx.throw(401, '权限不足');
    const obj = {disabled: false};
    if(disabled) obj.disabled = true;
    await targetPost.update(obj);
    if(targetPost.disabled === disabled) {
      if(!disabled) ctx.throw(400, '操作失败！该回复未被屏蔽，请刷新');
      if(disabled) ctx.throw(400, '操作失败！该回复在您操作之前已经被屏蔽了，请刷新');
    }
    data.targetUser = await targetPost.extendUser();
    let operation = 'disablePost';
    if(!disabled) operation = 'enablePost';
    await ctx.generateUsersBehavior({
      operation,
      pid,
      tid: targetThread.tid,
      fid: targetThread.fid,
      isManageOp: true,
      toMid: targetThread.toMid,
      mid: targetThread.mid
    });
    await targetThread.updateThreadMessage();
    await next();
  });

module.exports = router;