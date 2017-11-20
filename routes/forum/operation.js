const Router = require('koa-router');
const operationRouter = new Router();

operationRouter
  .patch('/', async (ctx, next) => {
    const {db} = ctx;
    const {switchStatus, switchStatusOfCert} = ctx.body;
    const {fid} = ctx.params;
    const form = await db.ForumModel.findOnly({fid});
    if(switchStatus !== undefined) {
      if(form.visibility === switchStatus && switchStatus)
        ctx.throw(400, '该板块在您操作之前已经被设置成对用户可见了，请刷新');
      if(form.visibility === switchStatus && !switchStatus)
        ctx.throw(400, '该板块在您操作之前已经被设置成对用户不可见了，请刷新');
      const obj = {visibility: false};
      if(switchStatus) obj.visibility = true;
      await form.update(obj);
    } else if (switchStatusOfCert !== undefined) {
      if(form.isVisibleForNCC === switchStatusOfCert && switchStatusOfCert)
        ctx.throw(400, '该板块在您操作之前已经被设置成无权限不可见了，请刷新');
      if(form.isVisibleForNCC === switchStatusOfCert && !switchStatusOfCert)
        ctx.throw(400, '该板块在您操作之前已经被设置成无权限可见了，请刷新');
      const obj = {isVisibleForNCC: false};
      if(switchStatusOfCert) obj.isVisibleForNCC = true;
      await form.update(obj);
    } else {
      ctx.throw(400, '参数不正确');
    }
    await next();
  });

module.exports = operationRouter;