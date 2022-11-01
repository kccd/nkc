const router = require('koa-router')();
const quoteRouter = require("./quote");
const editorRouter = require("./editor");
const disabledRouter = require("./disabled");
const unblockRouter = require("./unblock");
const optionsRouter = require("./options");
const ipInfoRouter = require("./ipInfo");
const creditRouter = require("./credit");
const digestRouter = require("./digest");
const voteRouter = require('./vote');
const customCheerio = require("../../nkcModules/nkcRender/customCheerio");
module.exports = router;
router
  .get('/', async (ctx, next) => {
    //获取该图书下的全部评论和用户编辑框中未发布的内容
    const {db, data, state, query, permission} = ctx;
    const {sid} = query;
    const {user} = data;
    //虎丘当前文章下已经发布的文章
    let comments = await db.CommentModel.find({sid, source: 'comment'}).sort({toc: 1});
    //获取当前文章下的当前用户为发表的评论草稿
    let comment = await db.CommentModel.findOne({uid: state.uid, source: 'comment'}).sort({toc: -1}).limit(1);
    //管理员权限
    const permissions = {
      reviewed: null,
      disabled: null,
    };
    if(user) {
      //审核权限
      if(permission('review')) {
        permissions.reviewed = true;
      }
      //禁用和退修权限
      if(ctx.permission('movePostsToRecycle') || ctx.permission('movePostsToDraft')) {
        permissions.disabled = true
      }
    }
    //获取当前用户对该图书的权限
    comments = await db.CommentModel.extendPostComments({comments, uid: state.uid, permissions});
    let document;
    if(comment) {
      document = await db.DocumentModel.findOne({did: comment.did, type: 'beta'});
    }
    if(document) {
      comment.content = document.content;
      comment = comment.toObject();
    } else {
      comment = '';
    }
    //评论权限
    data.permissions = permissions;
    data.comment = comment;
    data.comments = comments;
    await next();
  })
  .post('/', async (ctx, next) => {
    //创建，修改，发布评论
    const {db, body, data, state, nkcModules} = ctx;
    const {
      source,
      aid,
      content,
      quoteDid,
      type,
      commentId,
      commentType, //用于判断当前提交的数据的sid是articleId还是articlePostId
      toColumn
    } = body;
    // let articlePost;
    // //当sid为comment的sid时
    // if(commentType === 'comment') {
    //   //获取引用id
    //   articlePost = await db.ArticlePostModel.findOnly({_id: sid});
    //   if(!articlePost) ctx.throw(400, '未找到引用，请刷新');
    // }
    let article = await db.ArticleModel.findOnly({_id: aid});
    if(!article) ctx.throw(400, '未找到文章，请刷新后重试');
    const {normal: normalStatus} = await db.ArticleModel.getArticleStatus();
    if(article.status !== normalStatus) {
      return ctx.throw(403, '文章状态异常,暂不可评论');
    }
    const _content = customCheerio.load(content).text();
    if(_content.length > 1000) ctx.throw(400, '内容不能超过1000字');
    nkcModules.checkData.checkString(content, {
      name: "内容",
      minLength: 0,
      maxLength: 2000
    });
    if(!['modify', 'publish', 'create', 'save'].includes(type)) ctx.throw(400, `未知的提交类型 type: ${type}`);
    let comment;
    if(commentId) {
      comment = await db.CommentModel.findOne({_id: commentId, uid: state.uid});
    }
    if(type === 'create' && !comment) {
      comment = await db.CommentModel.createComment({
        uid: state.uid,
        content,
        quoteDid,
        source: article.source,
        aid,
        ip: ctx.address,
        port: ctx.port
      });
    } else if(comment) {
      await comment.modifyComment({
        quoteDid,
        content
      });
      if(type === 'publish') {
        nkcModules.checkData.checkString(content, {
          name: "内容",
          minLength: 1,
          maxLength: 2000
        });
        //获取推送到专栏信息
        if(toColumn) {
          //判断用户选择推送到专栏后是否选择专栏分类
          if(!toColumn.selectedMainCategoriesId || toColumn.selectedMainCategoriesId.length === 0) ctx.throw(401, '未选择文章专栏分类');
          //检测专栏分类是否有效
          await db.ColumnPostCategoryModel.checkColumnCategory(toColumn);
        }
        const key = await nkcModules.getRedisKeys('commentOrder', article._id);
        const lock = await nkcModules.redLock.lock(key, 6000);
        try{
          // 获取最新评论的楼层
          const order = await db.CommentModel.getCommentOrder(article._id);
          await comment.updateOrder(order);
          //发布评论
          data.renderedComment = await comment.publishComment(article, toColumn, {
            ip: ctx.address,
            port: ctx.port,
          });
          //更新评论引用的评论数replies
          await db.ArticlePostModel.updateOrder(order, article._id);
          await lock.unlock();
        } catch (err){
          await lock.unlock();
          throwErr(500, err);
        }
      } else if(type === 'save') {
        await comment.saveComment()
      }
    }
    if(comment) data.commentId = comment._id;
    await next();
  })
  .get('/:_id', async (ctx, next) => {
    //获取文章评论跳转到文章并定位到评论
    const {data, db, params, permission, query, nkcModules} = ctx;
    const {_id} = params;
    let comment = await db.CommentModel.findOnly({_id});
    //如果存在comment并且存在token就重定向到评论页面
    let url = (await comment.getLocationUrl()).url;
    // const arr = nkcModules.tools.segmentation(url, '?');
    // url = `${arr[0]}token=${token}&${arr[1]}`;
    return ctx.redirect(url);
    await next();
  })
  //获取评论的引用
  .get('/:_id/quote', quoteRouter)
  //获取评论编辑信息
  .get('/:_id/commentEditor', editorRouter)
  //废除， 评论退修或者禁用在审核路由传入docId即可
  .post('/:_id/disabled', disabledRouter)
  //评论解封
  .post('/:_id/unblock', unblockRouter)
  //获取评论更多操作权限
  .get('/:_id/options', optionsRouter)
  //获取评论作者的ip信息
  .get('/:_id/ipInfo', ipInfoRouter)
  .use('/:_id/digest', digestRouter.routes(), digestRouter.allowedMethods())
  .use('/:_id/credit', creditRouter.routes(), creditRouter.allowedMethods())
  .use('/:_id/vote', voteRouter.routes(), voteRouter.allowedMethods())
