const router = require('koa-router')();
router
  .get('', async (ctx, next) => {
    //获取当前登录用户的独立文章信息
    const { db, data, params, query, state, permission, nkcModules } = ctx;
    const {targetUser} = data;
    const match = {
      uid: targetUser.uid
    };
    const count = await db.ThreadModel.countDocuments(match);
    const paging = await nkcModules.apiFunction.paging(page, count);

    ctx.apiData = {
      threads: [{t:1},{t:2}],
      paging
    };
    await next();
  })
module.exports = router;
