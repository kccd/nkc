const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    //获取创作中心草稿
    const {data, db, state, query, nkcModules} = ctx;
    const {page = 0, del, quota = 30} = query;
    const {uid} = state;
    const queryMap = {
      uid,
      del: del === 'true',
    };
    const count = await db.CreationDraftsModel.countDocuments(queryMap);
    const paging = nkcModules.apiFunction.paging(page, count, quota);
    const drafts = await db.CreationDraftsModel.find(queryMap).sort({toc: -1}).skip(paging.start).limit(Number(paging.perpage));
    data.draftsData = await db.CreationDraftsModel.extentDraftsData(drafts);
    data.paging = paging;
    await next();
  })
  .get('/editor', async (ctx, next) => {
    //获取草稿文档内容
    const {data, db, query, state} = ctx;
    const {draftId} = query;
    const draft = await db.CreationDraftsModel.getUserDraftById(draftId, state.uid);
    data.draftData = await draft.getDraftData();
    ctx.remoteTemplate = 'vueRoot/index.pug';
    await next();
  })
  .post('/editor', async (ctx, next) => {
    //创建，删除，编辑草稿
    const {data, db, state, body} = ctx;
    const {type, title, content, draftId} = body;
    if(!['create', 'modify', 'save', 'autoSave'].includes(type)) ctx.throw(400, `未知 ${type}类型`)
    let draft;
    if(type === 'create') {
      //创建草稿和文档
      draft = await db.CreationDraftsModel.createDraft({
        ip: ctx.address,
        port: ctx.port,
        uid: state.uid,
        title,
        content,
      });
    } else {
      // 修改草稿
      draft = await db.CreationDraftsModel.getUserDraftById(draftId, state.uid);
      if(type === 'modify') {
        await draft.modifyDraft({
          title,
          content,
        });
      }
      if(type === 'save') {
        await draft.saveDraft();
      } else if (type === 'autoSave') {
        await draft.autoSaveDraft();
      }
    }
    data.draftId = draft._id;
    await next();
  });
module.exports = router;
