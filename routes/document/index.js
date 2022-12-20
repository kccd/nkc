const router = require('koa-router')();
const nkcRender = require('../../nkcModules/nkcRender');
/*
* 如果是专栏文章预览就返回分类信息
*/
// async function setCategory(data, state, db, source) {
//   if(source === 'article'){
//     const articleSource = await db.ArticleModel.findOne({_id: data.document.sid, uid: state.uid},{source: 1});
//     if(articleSource.source === "column"){
//       const category = await db.ColumnPostModel.findOne({pid: articleSource._id, tUid: state.uid}, { cid: 1, mcid: 1, columnId: 1 })
//       const { cid, mcid, columnId } = category;
//       const column = await db.ColumnModel.findOne({_id: columnId}, {name: 1})
//       // 分类和专栏名
//       data.mainCategory = await db.ColumnPostCategoryModel.getParentCategoryByIds(cid);
//       data.auxiliaryCategory = await db.ColumnPostCategoryModel.getArticleAllMinorCategories(mcid);
//       data.columnName = column.name;
//     }
//   }
// }
router
.get('/preview', async (ctx, next) => {
  //获取文档预览信息
  ctx.template='document/preview/document.pug'
  const {db, data, state, query, permission, nkcModules} = ctx;
  const {sid, source} = query;
  // 需要返回 分类信息
  const document = await db.DocumentModel.find({sid, source, uid: state.uid, type: "beta"}).sort({tlm: -1}).skip(0).limit(1);
  if(!document.length) ctx.throw(400, "该文章已被发布")

  // 用于pug渲染判断当前是什么类型页面
  data.type = source;
  data.document = document[0];
  // 访问的文章是否是作者本人如果不是那么判断是否有权限访问
  if(data.document.uid !== state.uid){
    if(!permission("viewUserArticle")) ctx.throw(403, "没有权限")
  }
  const documentResourceId = await data.document.getResourceReferenceId();
  let resources = await db.ResourceModel.getResourcesByReference(documentResourceId);
  data.document.content = nkcRender.renderHTML({
    type: 'article',
    post: {
      c: data.document.content,
      resources
    },
  });
  // 查询文章作者
  const user = await db.UserModel.findOnly({uid: data.document.uid});
  const avatarUrl = nkcModules.tools.getUrl('userAvatar', user.avatar);
  data.user = {...user.toObject(), avatarUrl};
  if(data.document.origin !== 0){
    const originDesc = await nkcModules.apiFunction.getOriginLevel(data.document.origin);
    data.document = {...data.document.toObject(), originDesc};
  }else {
    data.document = data.document.toObject();
  }
  await next();
})
.get('/history', async (ctx, next)=>{
  //获取文档历史版本
  ctx.template = 'document/history/document.pug'
  const {db, data, state, query, permission, nkcModules} = ctx;
  const {sid, source, page=0} = query;
  data.type = source;
  const {betaHistory, stableHistory} = await db.DocumentModel.getDocumentTypes();
  const queryCriteria = { $and:[{ sid, source }, {type: {$in: [betaHistory, stableHistory]}}, {uid: state.uid}] };
  //  获取列表
  // 返回分页信息
  const count =  await db.DocumentModel.countDocuments(queryCriteria);
  const paging = nkcModules.apiFunction.paging(page, count, 10);
  data.paging = paging;
  data.history = await db.DocumentModel.find(queryCriteria).sort({tlm: -1}).skip(paging.start).limit(paging.perpage);
  if(data.history.length){
    // 默认返回第一项内容
    data.document = data.history[0];
    if(data.document.uid !== state.uid){
      if(!permission("viewUserArticle")) ctx.throw(403, "没有权限")
    }
    // data.document.user = await db.UserModel.findOnly({uid: data.document.uid});
    const documentResourceId = await data.document.getResourceReferenceId();
    let resources = await db.ResourceModel.getResourcesByReference(documentResourceId);
    data.document.content = nkcRender.renderHTML({
      type: 'article',
      post: {
        c: data.document.content,
        resources
      },
    });
    let article;
    let editorUrl;
    if (source === "article"){
      article  = await db.ArticleModel.findOne({_id: data.document.sid, uid: state.uid});
      //  选择此版本进行编辑的url
      editorUrl = await db.ArticleModel.getArticleUrlBySource(article._id, article.source, article.sid);
    }
    if( source === "draft"){
      editorUrl = await db.ArticleModel.getArticleUrlBySource(data.document.sid, data.document.source, data.document.sid);
    }
    if(!editorUrl){
      ctx.throw(400, "source参数不正确")
    }
    // data.bookId = bid
    // 包含了将此版本改为编辑版的url 组成
    data.urlComponent = {_id: data.document._id, source: data.document.source, sid: data.document.sid, editorUrl, page};
  }else{
    data.document = '';
    // data.bookId = ''
    data.urlComponent = ''
  }
  const user = await db.UserModel.findOnly({uid: data.document.uid});
  const avatarUrl = nkcModules.tools.getUrl('userAvatar', user.avatar);
  data.user = {...user.toObject(), avatarUrl};
  if(data.document.origin !== 0){
    const originDesc = await nkcModules.apiFunction.getOriginLevel(data.document.origin);
    data.document = {...data.document.toObject(), originDesc};
  }else {
    data.document = data.document.toObject();
  }
  await next()
})
.get('/history/:_id',async (ctx, next)=>{
  ctx.template = 'document/history/document.pug'
  const {db, data, params, state, query, permission, nkcModules} = ctx;
  const { sid, source, page=0 } = query;
  const { _id } = params;
  data.type = source;
  const {betaHistory, stableHistory} = await db.DocumentModel.getDocumentTypes();
  const queryCriteria = { sid, source, type: {$in: [betaHistory, stableHistory]}, uid: state.uid };
  const count =  await db.DocumentModel.countDocuments(queryCriteria);
  const paging = nkcModules.apiFunction.paging(page, count, 10);
  data.type = source;
  data.history =  await db.DocumentModel.find(queryCriteria).sort({tlm:-1}).skip(paging.start).limit(paging.perpage);
  function find(data, id){
    for (const obj of data) {
      if(obj._id === id) return obj
    }
  }
  // 在 历史记录中找到当前需要显示内容的文章
  data.document = find(data.history, Number(_id));
  if(!data.document){
    // 如果添加了很多历史记录，而没有刷新，直接点击历史就可能出现在当前页找不到指定的数据，因为数据发生了改变（主要是可能排在了其他页中）
    data.document = data.history[0];
  }
  if(data.document.uid !== state.uid){
    if(!permission("viewUserArticle")) ctx.throw(403, "没有权限");
  }
  data.paging = paging;
  const documentResourceId = await data.document.getResourceReferenceId();
  let resources = await db.ResourceModel.getResourcesByReference(documentResourceId);
  data.document.content = nkcRender.renderHTML({
    type: 'article',
    post: {
      c: data.document.content,
      resources
    },
  });
  let article;
  let editorUrl;
  if (source === "article"){
    article  = await db.ArticleModel.findOne({_id: data.document.sid, uid: state.uid});
    //  选择此版本进行编辑的url
    editorUrl = await db.ArticleModel.getArticleUrlBySource(article._id, article.source, article.sid);
  }
  if( source === "draft"){
    editorUrl = await db.ArticleModel.getArticleUrlBySource(data.document.sid, data.document.source, data.document.sid);
  }
  if(typeof editorUrl === "undefined"){
    throw "editorUrl is not defined"
  }
  data.urlComponent = {_id: data.document._id, source: data.document.source, sid: data.document.sid, editorUrl, page};
  const user = await db.UserModel.findOnly({uid: data.document.uid});
  const avatarUrl = nkcModules.tools.getUrl('userAvatar', user.avatar);
  data.user = {...user.toObject(), avatarUrl};
  if(data.document.origin !== 0){
    const originDesc = await nkcModules.apiFunction.getOriginLevel(data.document.origin);
    data.document = {...data.document.toObject(), originDesc};
  }else {
    data.document = data.document.toObject();
  }
  await next()
})
.post('/history/:_id/edit',async (ctx, next)=>{
  const {db, params, query, state} = ctx;
  //  正在编辑的改为历史版
  const { sid, source } = query
  // 当前历史记录改为编辑版，并且复制了一份为历史版
  const { _id } = params;
  await db.DocumentModel.copyToHistoryToEditDocument(state.uid, sid, source, Number(_id));
  await next()
})
module.exports = router;
