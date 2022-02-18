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
    const paging = nkcModules.apiFunction.paging(page, count, Number(quota));
    const drafts = await db.CreationDraftsModel.find(queryMap).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.draftsData = await db.CreationDraftsModel.extentDraftsData(drafts);
    data.paging = paging;
    await next();
  })
  .get('/column', async (ctx, next)=>{
    const {query, db, state, nkcModules, data} = ctx;
    const {pageNumber = 0, pageLimit = 30} = query;
    const {uid} = state;
    // uid 先使用92837
    const queryCriteria = {
      uid:92837,
      source:'column',
      hasDraft:true
    }
    const count = await db.ArticleModel.countDocuments(queryCriteria);
    console.log(count,'专栏草稿总条数')
    if(count === 0) {
      data.draftsData = []
    }else{
      const paging = nkcModules.apiFunction.paging(pageNumber, count, Number(pageLimit));
      const columnsDocument =await db.ArticleModel.find(queryCriteria).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
      const dids = new Set();
      const resIds = [];
      for (const item of columnsDocument) {
        dids.add(item.did)
        // did 文档id。 aid 文章id。 cid 专栏id
        resIds.push({aId:item._id})
      }
      const columnDocument = await db.DocumentModel.find({
        type:'beta',
        source:'column',
        did:{
          $in:[...dids]
        }
      })
      console.log(columnDocument,'columnDocument')
      const responseKey = ['title','content','toc']
      // responseKey 响应数据包含key   
      data.draftsData =await db.ArticleModel.filterAndExtendData(responseKey, columnDocument, resIds)
    }
    
    await next()
  })
  .get('/editor', async (ctx, next) => {
    //获取草稿文档内容
    const {data, db, query, state} = ctx;
    const {draftId} = query;
    const draft = await db.CreationDraftsModel.getUserDraftById(draftId, state.uid);
    data.draftData = await draft.getDraftData();
    ctx.remoteTemplate = 'creation/index.pug';
    await next();
  })
  .post('/editor', async (ctx, next) => {
    //创建，删除，编辑草稿
    const {data, db, state, body} = ctx;
    const {type, title, content, draftId} = body;
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
      draft = await db.CreationDraftsModel.getUserDraftById(draftId, state.uid);
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
    await next();
  });
module.exports = router;
