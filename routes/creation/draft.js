const { OnlyUser, OnlyUnbannedUser } = require('../../middlewares/permission');

const router = require('koa-router')();
router
  .get('/:id', OnlyUser(), async (ctx, next) => {
    const { data, params, db, state } = ctx;
    const { id: draftId } = params;
    const draft = await db.DocumentModel.findOne({
      sid: draftId,
      uid: state.uid,
    });
    if (!draft) ctx.throw(400, '不存在该片段，请刷新试试');
    data.draftData = draft;
    await next();
  })
  .del('/:id', OnlyUnbannedUser(), async (ctx, next) => {
    const { query, params, db, state } = ctx;
    const { id: draftId } = params;
    const { type } = query;
    if (!['delete', 'recover'].includes(type))
      ctx.throw(400, `未知操作类型 type=${type}`);
    const draft = await db.CreationDraftsModel.getUserDraftById(
      draftId,
      state.uid,
    );
    await draft.updateOne({
      $set: {
        del: type === 'delete',
        tlm: new Date(),
      },
    });
    await next();
  });
module.exports = router;
