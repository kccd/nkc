const router = require('koa-router')();
const columnTypes = {
  comment: 'comment',
  article: 'article'
};
router
  .use('/', async (ctx, next) => {
    const {data, query, state, db} = ctx;
    let {t} = query;
    if(t !== columnTypes.comment) {
      t = columnTypes.article;
    }
    data.columnTypes = columnTypes;
    data.t = t;
    data.pageTitle = `专栏 - ${data.pageTitle}`;

    await db.ColumnModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map(r => r._id),
      gradeId: state.uid? data.userGrade._id: undefined,
      isApp: state.isApp,
    });

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
    const permissions = {
      reviewed: null,
    };
    const {
      normal: normalStatus,
      disabled: disabledStatus,
      faulty: faultyStatus,
      unknown: unknownStatus,
    } = await db.ArticleModel.getArticleStatus();
    //获取专栏引用类型
    const {thread: threadType, article: articleType} = await db.ColumnPostModel.getColumnPostTypes();
    const tidArr = [];
    const aidArr = [];

    const pageSettings = await db.SettingModel.getSettings('page');
    //查找所有专栏引用
    const count = await db.ColumnPostModel.countDocuments().sort({toc: -1});
    const paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
    //查找文章专栏引用
    const columnPosts = await db.ColumnPostModel.find({type: {$in: [threadType, articleType]}, hidden: false}).skip(paging.start).limit(paging.perpage).sort({toc: -1});
    const columnPostsObj = {};
    columnPosts.map(c => {
      columnPostsObj[c.pid] = c;
    })
    for(const c of columnPosts) {
      if(c.type === threadType) {
        tidArr.push(c.pid);
      } else if(c.type === articleType) {
        aidArr.push(c.pid);
      }
    }
    const q = {
      oc: {$in: tidArr},
      mainForumsId: {
        $in: fidOfCanGetThreads
      }
    };
    const match = {
      _id: {$in: aidArr},
      $or: [
        {
          status: normalStatus,
        }
      ]
    };
    let canManageFid = [];
    if(user) {
      if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
        permissions.reviewed = true;
      }
      canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
      if(!ctx.permission("superModerator")) {
        q.$or = [
          {
            reviewed: true
          },
          {
            reviewed: false,
            mainForumsId: {
              $in: canManageFid
            }
          }
        ]
      }
      match.$or.push(
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
      })
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
    const superModerator = ctx.permission("superModerator");
    columnThreads = columnThreads.filter(thread => {
      if(thread.disabled || thread.recycleMark) {
        if(!user) return false;
        if(!superModerator) {
          let isModerator = false;
          const mainForumsId = thread.mainForumsId;
          for (const fid of mainForumsId) {
            if (canManageFid.includes(fid)) {
              isModerator = true;
              break;
            }
          }
          if(!isModerator) return false;
        }
      }
      return true;
    });
    columnThreads = await db.ThreadModel.extendArticlesPanelData(columnThreads);

    const threadObj = {};
    for(const thread of columnThreads) {
      const columnPost = columnPostsObj[thread.oc];
      if(columnPostsObj) {
        thread.content.url = nkcModules.tools.getUrl('columnThread', columnPost.columnId, columnPost._id);
        threadObj[columnPost.pid] = thread;
      }

    }
    //查找最新专栏文章的独立文章
    let columnArticles = await db.ArticleModel.find(match);
    //拓展独立文章
    columnArticles = await db.ArticleModel.extendArticlesPanelData(columnArticles);
    const articleObj = {};
    for(const ca of columnArticles) {
      articleObj[ca.id] = ca;
    }
    const threads = [];
    for(const c of columnPosts) {
      let thread;
      if(c.type === threadType) {
        thread = threadObj[c.pid];
      } else if(c.type === articleType) {
        thread = articleObj[c.pid];
      }
      if(thread) threads.push(thread);
    }
    data.permissions = permissions;
    data.latestColumnArticlePanelStyle = pageSettings.articlePanelStyle.latestColumn;
    data.articlesPanelData = threads;
    data.paging = paging;
    ctx.remoteTemplate = 'latest/column/article.pug';
    await next();
  })
  // .get('/', async (ctx, next) => {
  //   //拓展最新页专栏文章评论列表
  //   const {db, state, data, query, nkcModules, permission} = ctx;
  //   const {t, columnTypes} = data;
  //   if(t !== columnTypes.comment) {
  //     return await next();
  //   }
  //   const {page = 0} = query;
  //   const {
  //     unknown: unknownStatus,
  //     faulty: faultyStatus,
  //     normal: normalStatus,
  //     disabled: disabledStatus,
  //   } = await db.CommentModel.getCommentStatus();
  //   const {} = await db.CommentModel.getCommentSources();
  //   let match = {
  //     source:
  //     status: normalStatus
  //   };
  //   //获取当前用户对独立文章评论的审核权限
  //   const permissions = {
  //     reviewed: null,
  //   };
  //   if(state.uid) {
  //     //加载自己非正常状态的评论
  //     match = {
  //       $or: [
  //         {
  //           status: normalStatus,
  //         },
  //         {
  //           uid: state.uid,
  //           status: {
  //             $in: [
  //               normalStatus,
  //               faultyStatus,
  //               disabledStatus,
  //               unknownStatus,
  //             ]
  //           }
  //         }
  //       ]
  //     };
  //     if(permission('movePostsToRecycle') || permission('movePostsToDraft')) {
  //       permissions.reviewed = true;
  //     }
  //   }
  //   const count = await db.CommentModel.countDocuments(match);
  //   const paging = nkcModules.apiFunction.paging(page, count);
  //   const comments = await db.CommentModel
  //     .find(match)
  //     .sort({toc: -1})
  //     .skip(paging.start)
  //     .limit(paging.perpage);
  //   data.commentDatas = await db.CommentModel.extendCommentsListsData(comments, state.uid);
  //   data.paging = paging;
  //   data.permissions;
  //   ctx.remoteTemplate = 'latest/column/comment.pug';
  //   await next();
  // })

module.exports = router;
