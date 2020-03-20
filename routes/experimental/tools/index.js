const Router = require('koa-router');
const router  = new Router();

router
  // 查看工具列表
  .get("/" , async (ctx, next) => {
    const {data, db, params} = ctx;
    let list = await db.ToolsModel.find();
    list.forEach((model, index) => {
      list[index] = model._doc;
    })
    data.list = list;
    ctx.template = "experimental/tools/tools.pug";
    await next();
  })


module.exports = router;