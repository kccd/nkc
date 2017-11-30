const Router = require('koa-router');
const operationRouter = new Router();

operationRouter
  .patch('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {switchStatus, switchStatusOfCert} = ctx.body;
    const {fid} = ctx.params;
    const form = await db.ForumModel.findOnly({fid});
    if(data.userLevel < 6) ctx.throw(401, '权限不足');
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
        ctx.throw(400, '该板块在您操作之前已经被设置成无权限可见了，请刷新');
      if(form.isVisibleForNCC === switchStatusOfCert && !switchStatusOfCert)
        ctx.throw(400, '该板块在您操作之前已经被设置成无权限不可见了，请刷新');
      const obj = {isVisibleForNCC: false};
      if(switchStatusOfCert) obj.isVisibleForNCC = true;
      await form.update(obj);
    } else {
      ctx.throw(400, '参数不正确');
    }
    await next();
  })
  .get('/category', async (ctx, next) => {
    const {data, db} = ctx;
    const {fid} = ctx.params;
    const visibleFid = await ctx.getVisibleFid();
    if(!visibleFid.includes(fid)) ctx.throw(401,'权限不足');
    data.categorys = await db.ThreadTypeModel.find({fid}).sort({order: 1});
    await next();
  })
  .post('/category', async (ctx, next) => {
    const {data, db} = ctx;
    const {fid} = ctx.params;
    const {name} = ctx.body;
    if(!name) ctx.throw(400, '名字不能位空');
    let order = 0;
    const category = await db.ThreadTypeModel.findOne({fid}).sort({order: -1});
    if(category) order = category.order + 1;
    const cid = await db.SettingModel.operateSystemID('threadTypes', 1);
    const newCategory = new db.ThreadTypeModel({
      cid,
      order,
      fid,
      name
    });
    try{
      await newCategory.save();
    } catch (err) {
      await db.SettingModel.operateSystemID('threadTypes', -1);
      ctx.throw(500, `增加分类出错: ${err}`);
    }
    await next();
  })
  .patch('/category', async (ctx, next) => {
    const {data, db} = ctx;
    const {cid, name} = ctx.body;
    if(!name) ctx.throw(400, '名字不能位空');
    const category = await db.ThreadTypeModel.findOnly({cid});
    await category.update({name});
    await next();
  })
  .del('/category/:cid', async (ctx, next) => {
    const {db} = ctx;
    const {cid} = ctx.params;
    await db.ThreadModel.updateMany({cid}, {$set: {cid: 0}});
    await db.ThreadTypeModel.deleteOne({cid});
    await next();
  });

module.exports = operationRouter;