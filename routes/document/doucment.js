const router = require('koa-router')();
const nkcRender = require('../../nkcModules/nkcRender');

router
.get('preview', async (ctx, next) => {
  ctx.template='document/preview/document.pug'
  const {db, data, state, query, permission} = ctx;
  if(!permission("viewUserArticle")) ctx.throw(400, "没有权限")
  const {sid, source} = query;
  const document = await db.DocumentModel.find({sid, source, uid: state.uid, type: "beta"}).sort({tlm: -1}).skip(0).limit(1);
  if(!document.length) ctx.throw(400, "该文章已被发布")
  let user = await db.UserModel.findOne({uid: state.uid});
  user = user.toObject();
  
  // 用于pug渲染判断当前是什么类型页面 
  data.type = source; 
  data.document = document[0]; 
  const documentResourceId = await data.document.getResourceReferenceId();
  let resources = await db.ResourceModel.getResourcesByReference(documentResourceId);
  data.document.content = nkcRender.renderHTML({
    type: 'article',
    post: {
      c: data.document.content,
      resources
    },
  });
  data.document.avatar = user.avatar; 
  await next();
})
.get('history', async (ctx, next)=>{
  ctx.template = 'document/history/document.pug'
  const {db, data, state, query, permission} = ctx;
  if(!permission("viewUserArticle")) ctx.throw(400, "没有权限")
  const {sid, source} = query;
  data.type = source; 
  //  获取列表
  data.history = await db.DocumentModel.find({ $and:[{ sid, source }, {type: 'history'}, {uid: state.uid}] }).sort({ tlm:-1 });
  if(data.history.length){
    // 默认返回第一项内容
    data.document = data.history[0]
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
    // data.bookId = bid
    // 包含了将此版本改为编辑版的url 组成
    data.urlComponent = {_id: data.document._id, source: data.document.source, sid: data.document.sid, editorUrl};
  }else{
    data.document = '',
    // data.bookId = ''
    data.urlComponent = ''
  }
  await next()
})
.get('history/:_id',async (ctx, next)=>{
  ctx.template = 'document/history/document.pug'
  const {db, data, params, state, query, permission} = ctx;
  if(!permission("viewUserArticle")) ctx.throw(400, "没有权限");
  const { sid, source } = query;
  const { _id } = params;
  data.type = source; 
  data.history =  await db.DocumentModel.find({ sid, source, type: 'history', uid: state.uid }).sort({tlm:-1});
  function find(data, id){
    for (const obj of data) {
      if(obj._id == id) return obj
    }
  }
  // 在 历史记录中找到当前需要显示内容的文章
  data.document = find(data.history, _id);
  // 点击当前版本进行编辑后 前端会刷新当前页面 而_id 的文章已经变为编辑版 不存在历史记录中，因此默认返回第一条数据 
  if(!data.document){
    data.document = data.history[0];
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
  let article;
  let editorUrl;
  if (source === "article"){
    article  = await db.ArticleModel.findOne({_id: data.document.sid, uid: state.uid});
    //  选择此版本进行编辑的url
    editorUrl = { editorUrl } = await db.ArticleModel.getArticleUrlBySource(article._id, article.source, article.sid);
  }
  if( source === "draft"){
    editorUrl = await db.ArticleModel.getArticleUrlBySource(data.document.sid, data.document.source, data.document.sid);
  }
  if(typeof editorUrl === "undefined"){
    throw "editorUrl is not defined"
  }
  data.urlComponent = {_id: data.document._id, source: data.document.source, sid: data.document.sid, editorUrl};
  await next()
})
.post('history/:_id/edit',async (ctx, next)=>{
  const {db, params, query, state} = ctx;
  //  正在编辑的改为历史版
  const { sid, source } = query
  // 当前历史记录改为编辑版，并且复制了一份为历史版 
  const { _id } = params;
  await db.DocumentModel.copyToHistoryToEditDocument(state.uid, sid, source, _id);
  await next()
})
module.exports = router;