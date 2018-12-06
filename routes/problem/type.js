const Router = require('koa-router');
const router = new Router();
router
  .post('/', async (ctx, next) => {
    const {db, body} = ctx;
    let {name} = body;
    name = name.trim();
    const sameName = await db.ProblemsTypeModel.findOne({name});
    if(sameName) ctx.throw(400, '分类名已存在');
    const type = db.ProblemsTypeModel({
      _id: await db.SettingModel.operateSystemID('problemsTypes', 1),
      name
    });
    await type.save();
    await next();
  })
  .patch('/:typeId', async (ctx, next) => {
    const {db, body, params} = ctx;
    let {typeId} = params;
    typeId = Number(typeId);
    let {name} = body;
    name = name.trim();
    const sameName = await db.ProblemsTypeModel.findOne({name, _id: {$ne: typeId}});
    if(sameName) ctx.throw(400, '分类名已存在');
    await db.ProblemsTypeModel.update({_id: typeId}, {$set: {name}});
    await next();
  })
  .del('/:typeId', async (ctx, next) => {
    const {db, params} = ctx;
    let {typeId} = params;
    typeId = Number(typeId);
    if(typeId === 0) ctx.throw(400, '默认分类不可删除');
    const type = await db.ProblemsTypeModel.findOnly({_id: typeId});
    await db.ProblemModel.updateMany({typeId: type._id}, {$set: {typeId: 0}});
    await type.remove();
    await next();
  });
module.exports = router;