const router = require('koa-router')();
router
  .get("/", async (ctx, next) => {
    const {db, data, params, state} = ctx;
    const {did: draftId} = params;
    const draft = await db.CreationDraftsModel.getUserDraftById(draftId, state.uid);
    data.draftData = await draft.getDraftData();
    await next();
  })
  .del("/", async (ctx, next) => {
    const {query, db, state} = ctx;
    const {type, id, operation} = query;
    const allowType = ['column', 'custom']
    if(!['delete', 'recover'].includes(operation)) ctx.throw(400, `未知操作 ${operation}类型`)
    if(!allowType.includes(type)) ctx.throw(400, `未知文章 ${operation}类型`)
    if(custom === 'custom'){
      const draft = await db.CreationDraftsModel.getUserDraftById(draftId, state.uid);
      if(draft.uid !== state.uid) ctx.throw(403, `权限不足`);
      await draft.updateOne({
        $set: {
          del: operation === 'delete',
          toc: new Date(),
        }
      });
      await next();
    }
    else if(operation === 'column'){

    }
  })
module.exports = router;