const router = require('koa-router')();
router
  .use('/', async (ctx, next) => {
    const {data, db} = ctx;
    ctx.remoteTemplate = 'creation/index.pug';
    await next();
  })
  .get('/', async (ctx, next) => {
    //获取创作中心草稿
    const {data, db, state, query, nkcModules} = ctx;
    let {quota, skip, type} = query;
    const {user} = data;
    const {uid} = state;
    quota = parseInt(quota);
    skip = parseInt(skip);
    let queryMap;
    if(type === 'all') {
      queryMap = {"uid": user.uid, "del": false}
    } else if(type === 'trash') {
      queryMap = {"uid": user.uid, "del": true}
    }
    let newSkip = quota * skip;
    let mediaCount = await db.CreationDraftsModel.find(queryMap).countDocuments();

    data.paging = nkcModules.apiFunction.paging(skip, mediaCount, quota);
    let maxSkip = Math.ceil(mediaCount / quota);
    if(maxSkip < 1) maxSkip = 1;
    if(skip >= maxSkip){
      ctx.data.skip = maxSkip - 1;
    }else{
      ctx.data.skip = skip;
    }
    if(newSkip > mediaCount) {
      ctx.throw(400, '已经是最后一页了')
    }
    ctx.data.maxSkip = maxSkip;
    let drafts = await db.CreationDraftsModel.find(queryMap).sort({toc: -1}).skip(newSkip).limit(quota);
    drafts = await db.CreationDraftsModel.extentDrafts(drafts);
    data.drafts = drafts;
    await next();
  })
  .get('/draftEdit', async (ctx, next) => {
    //获取草稿文档内容
    const {data, db, query} = ctx;
    const {documentDid} = query;
    const document = await db.DocumentModel.findOne({did: documentDid, type: {$in: ['beta', 'stable']}});
    if(!document) ctx.throw(400, '未找到草稿');
    data.document = document;
    ctx.remoteTemplate = 'creation/index.pug';
    await next();
  })
  .post('/draftEdit', async (ctx, next) => {
    //创建，删除，编辑草稿
    const {data, db, state, body} = ctx;
    const {type, title, content, draftId, documentId} = body;
    if(!['create', 'modify', 'save'].includes(type)) ctx.throw(400, `未知 ${type}类型`)
    let draft;
    if(type === 'create') {
      //创建草稿和文档
      draft = await db.CreationDraftsModel.createDraft({
        uid: state.uid,
        title,
        content,
      });
    } else {
      // 修改草稿
      draft = await db.CreationDraftsModel.findOnly({_id: draftId});
      if(!draft) ctx.throw(400, '未找到草稿，请刷新后重试');
      if(type === 'modify') {
        await draft.modifyDraft({
          title,
          content,
        });
      }
      if(type === 'save') {
        await draft.saveDraft();
      }
    }
    data.draftId = draft._id;
    data.documentDid = draft.did;
    await next();
  })
  .del('/', async (ctx, next) => {
    const {query, db} = ctx;
    const {_id, type} = query;
    if(!['delete', 'recover'].includes(type)) ctx.throw(400, `未知 ${type}类型`)
    await db.CreationDraftsModel.updateOne({_id}, {
      $set: {
        del: type === 'delete'?true:false
      }
    });
    await next();
  })
module.exports = router;
