const router = require('koa-router')();
const draftRouter = require('./draft');
const optionsRouter = require('./options');
const unblockRouter = require('./unblock');
const collectionRouter = require('./collection');
const digestRouter = require('./digest');
const homeTopRouter = require('./homeTop');
const creditRouter = require('./credit');
const voteRouter = require('./vote');
const nkcRender = require('../../nkcModules/nkcRender');
const { OnlyUser } = require('../../middlewares/permission');
router
  .get('/:aid', OnlyUser(), async (ctx, next) => {
    const { params, db, state, permission, data, query, nkcModules } = ctx;
    const { aid: sid } = params;
    const { page = 0 } = query;
    const { uid, pageSettings } = state; //登录用户uid
    // 查看 文章的内容信息
    // 文章权限：status:normal
    //获取文档预览信息
    // const { sid, source } = query;
    const documentTypes = await db.DocumentModel.getDocumentTypes();
    const documentSources = await db.DocumentModel.getDocumentSources();
    const { normal: normalStatus } = await db.DocumentModel.getDocumentStatus();
    // 需要返回 分类信息
    const document = await db.DocumentModel.findOne({
      sid,
      source: documentSources.article,
      type: documentTypes.stable,
    }).sort({ tlm: -1 });
    const article = await db.ArticleModel.findOne({_id:sid });
    if (!document || !article) {
      ctx.throw(400, '没有可以查看的内容');
    }
    if (article.status !== normalStatus && !permission('review') && article.uid !== uid) {
      ctx.throw(403, '根据相关法律法规和政策，内容不予显示。');
    }
    let columnIds = article.sid.split('-').filter(item=>!!item&&item!=='null').map(item=>Number(item));
    const contributes = await db.ColumnContributeModel.find({tid:sid,source:'article'});
    for(const contribute of contributes){
      columnIds.push(contribute.columnId);
    }
    columnIds = [...new Set([...columnIds])];
    const columns =  await db.ColumnModel.find({_id:{$in:columnIds}});
    let  permissionUIds = [];
    for(const column of columns){
      permissionUIds.push(column.uid)
      for(const user of column.users){
        if(user.permission.includes('column_settings_contribute')){
          permissionUIds.push(user.uid);
        }
      }
    }
    permissionUIds = [...new Set([...permissionUIds])];
    // 用户权限：文章主、管理员（具有审核权限）、具有投稿记录文章的专栏管理员具有投稿处理权限、专栏主
    if(uid !== document.uid && !permission('review') && !permissionUIds.includes(uid)){
      return ctx.throw(403, '权限不足');
    }
    // 用于pug渲染判断当前是什么类型页面
    data.type = documentSources.article;
    data.document = document;
    const documentResourceId = await data.document.getResourceReferenceId();
    let resources = await db.ResourceModel.getResourcesByReference(
      documentResourceId,
    );
    data.document.content = nkcRender.renderHTML({
      type: 'article',
      post: {
        c: data.document.content,
        resources,
      },
    });
    // 查询文章作者
    const user = await db.UserModel.findOnly({ uid: data.document.uid });
    const avatarUrl = nkcModules.tools.getUrl('userAvatar', user.avatar);
    data.user = { ...user.toObject(), avatarUrl };
    if (data.document.origin !== 0) {
      const originDesc = await nkcModules.apiFunction.getOriginLevel(
        data.document.origin,
      );
      data.document = { ...data.document.toObject(), originDesc };
    } else {
      data.document = data.document.toObject();
    }
    //查找文章的评论盒子
    const articlePost = await db.ArticlePostModel.findOne({
      sid: article._id,
      source: article.source,
    });
    let match = {};
    if (articlePost) {
      match.sid = articlePost._id;
    }
    let count = 0;
    //获取评论分页
    if (articlePost) {
      count = await db.CommentModel.countDocuments(match);
    }
    const paging = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.homeThreadList,
    );
    data.paging = paging;
    let comments = [];
    if (articlePost) {
      //获取该文章下的评论
      comments = await db.CommentModel.getCommentsByArticleId({
        match,
        paging,
      });
      if (comments && comments.length !== 0) {
        comments = await db.CommentModel.extendPostComments({
          comments,
          uid: state.uid,
          authorUid: article.uid,
        });
      }
    }
    data.comments = comments || [];
    ctx.template = 'document/preview/article.pug';
    await next();
  })
  .del('/:aid', async (ctx, next) => {
    const {params, db, state, permission} = ctx;
    const {aid} = params;
    const {uid} = state;//登录用户uid
    const article = await db.ArticleModel.getArticleByIdAndUid(aid, state.uid);
    // 针对 "source" : "column",---在删除文章之前需要检查文章是否已经成功投稿即具有专栏下的文章。
    if (article.source === 'column') {
      const columnPosts = await db.ColumnPostModel.find({ pid: article._id });
      if (columnPosts.length>0) {
        ctx.throw(400, "该文章已经在专栏中，请撤稿后重试");
      }
    }
    if(uid === article.uid || permission('deleteArticle')) {
        //删除已经发布的文章的同时删除该文章的所有草稿
        await article.deleteArticle();
    }
    await next();
  })
  .use('/:aid/draft', draftRouter.routes(), draftRouter.allowedMethods())
  .use('/:aid/options', optionsRouter.routes(), optionsRouter.allowedMethods())
  .use('/:aid/unblock', unblockRouter.routes(), unblockRouter.allowedMethods())
  .use('/:aid/collection', collectionRouter.routes(), collectionRouter.allowedMethods())
  .use('/:aid/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/:aid/homeTop', homeTopRouter.routes(), homeTopRouter.allowedMethods())
  .use('/:aid/credit', creditRouter.routes(), creditRouter.allowedMethods())
  .use('/:aid/vote', voteRouter.routes(), voteRouter.allowedMethods())
module.exports = router;

