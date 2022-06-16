const router = require('koa-router')();
const columnTypes = {
  comment: 'comment',
  article: 'article'
};
router
  .use('/', async (ctx, next) => {
    const {data, query} = ctx;
    let {t} = query;
    if(t !== columnTypes.comment) {
      t = columnTypes.article;
    }
    data.columnTypes = columnTypes;
    data.t = t;
    await next();
  })
  .get('/', async (ctx, next) => {
    //获取最新专栏文章列表信息
    const {db, data, query, nkcModules, state, permission, internalData} = ctx;
    const {t, columnTypes, user} = data;
    const {fidOfCanGetThreads} = internalData;
    if(t !== columnTypes.article) {
      return await next();
    }
    const {page = 0} = query;
    const {
      normal: normalStatus,
      disabled: disabledStatus,
      faulty: faultyStatus,
      unknown: unknownStatus,
    } = await db.ArticleModel.getArticleStatus();
    //获取专栏引用类型
    const {threadType, articleType} = await db.ColumnPostModel.getColumnPostTypes();
    const tidArr = [];
    const aidArr = [];
    const match = {
      status: normalStatus,
    };
    const count = await db.ThreadModel.countDocuments();
    const paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
    //查找文章专栏引用
    const columnPosts = await db.ColumnPostModel.find({type: {$in: [threadType, articleType]}, hidden: false}).skip(paging.start).limit(paging.perpage).sort({toc: -1});
    for(const c of columnPosts) {
      if(c.type === threadType) {
        tidArr.push(c.pid);
      } else if(c.type === articleType) {
        aidArr.push(c.pid);
      }
    }
    const q = {
      mainForumsId: {
        $in: fidOfCanGetThreads
      }
    };
    let canManageFid = [];
    if(user) {
      canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
    }
    if(user) {
      if(!ctx.permission("superModerator")) {
        q.$or = [
          {
            reviewed: true
          },/*
            {
              reviewed: false,
              uid: user.uid
            },*/
          {
            reviewed: false,
            mainForumsId: {
              $in: canManageFid
            }
          }
        ]
      }
    } else {
      q.reviewed = true;
    }
    //查找出最新专栏下的社区文章
    let columnThreads = await db.ThreadModel.find(q, {
      uid: 1, tid: 1, toc: 1, oc: 1, lm: 1,
      tlm: 1, fid: 1, hasCover: 1,
      mainForumsId: 1, hits: 1, count: 1,
      digest: 1, reviewed: 1,
      columnsId: 1,
      categoriesId: 1,
      disabled: 1, recycleMark: 1
    });
    //查找最新专栏文章的独立文章
    let columnArticles = await db.ArticleModel.find({_id: {$in: aidArr}});
    //拓展独立文章
    columnArticles = await db.ArticleModel.extendArticlesPanelData(columnArticles);
    const articleObj = {};
    for(const ca of columnArticles) {
      articleObj[ca._id] = ca;
    }
    
    const threadObj = {};
    for(const thread of columnThreads) {
      if(thread) {
        threadObj[thread.oc] = thread;
      }
    }
    // let match ={
    //   status: normalStatus,
    // };
    // if(state.uid) {
    //   match = {
    //     $or: [
    //       {
    //         status: normalStatus,
    //       },
    //       {
    //         uid: state.uid,
    //         status: {
    //           $in: [
    //             normalStatus,
    //             faultyStatus,
    //             disabledStatus,
    //             unknownStatus,
    //           ]
    //         }
    //       }
    //     ]
    //   }
    // }
    // const articles = await db.ArticleModel
    //   .find(match)
    //   .sort({toc: -1})
    //   .skip(paging.start)
    //   .limit(paging.perpage);
    // const pageSettings = await db.SettingModel.getSettings('page');
    
    data.latestColumnArticlePanelStyle = pageSettings.articlePanelStyle.latestColumn;
    data.articlesPanelData = await db.ArticleModel.extendArticlesPanelData(articles);
    data.paging = paging;
    ctx.remoteTemplate = 'latest/column/article.pug';
    await next();
  })
  .get('/', async (ctx, next) => {
    //拓展最新页专栏文章评论列表
    const {db, state, data, query, nkcModules, permission} = ctx;
    const {t, columnTypes} = data;
    if(t !== columnTypes.comment) {
      return await next();
    }
    const {page = 0} = query;
    const {
      unknown: unknownStatus,
      faulty: faultyStatus,
      normal: normalStatus,
      disabled: disabledStatus,
    } = await db.CommentModel.getCommentStatus();
    let match = {
      status: normalStatus
    };
    //获取当前用户对独立文章评论的审核权限
    const permissions = {
      reviewed: null,
    };
    if(state.uid) {
      //加载自己非正常状态的评论
      match = {
        $or: [
          {
            status: normalStatus,
          },
          {
            uid: state.uid,
            status: {
              $in: [
                normalStatus,
                faultyStatus,
                disabledStatus,
                unknownStatus,
              ]
            }
          }
        ]
      };
      if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
        permissions.reviewed = true;
      }
    }
    const count = await db.CommentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const comments = await db.CommentModel
      .find(match)
      .sort({toc: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    data.commentDatas = await db.CommentModel.extendCommentsListsData(comments, state.uid);
    data.paging = paging;
    data.permissions;
    ctx.remoteTemplate = 'latest/column/comment.pug';
    await next();
  })
module.exports = router;
