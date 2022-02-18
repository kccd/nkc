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
    // const {id: draftId,} = params;
    const {type, id} = query;
    if(!['delete', 'recover'].includes(type)) ctx.throw(400, `未知 ${type}类型`)
    const draft = await db.CreationDraftsModel.getUserDraftById(draftId, state.uid);
    if(draft.uid !== state.uid) ctx.throw(403, `权限不足`);
    await draft.updateOne({
      $set: {
        del: type === 'delete',
        toc: new Date(),
      }
    });
    await next();
  })
module.exports = router;