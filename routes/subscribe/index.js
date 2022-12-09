const router = require('koa-router')();
const momentRouter = require('./moment');
const nkcRender = require("../../nkcModules/nkcRender");
router
  .use('/', async (ctx, next) => {
    const {state, data, db, path, internalData} = ctx;

    // 游客跳转到首页
    if(!state.uid) {
      return ctx.redirect('/');
    }

    data.type = path.replace('/g/', '');
    data.navbar = {
      highlight: 'subscribe'
    };
    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user
    );
    // 筛选出没有开启流控的专业
    let  forumInReduceVisits = await db.ForumModel.find({openReduceVisits: true});
    forumInReduceVisits = forumInReduceVisits.map(forum => forum.fid);
    fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !forumInReduceVisits.includes(fid));

    internalData.fidOfCanGetThreads = fidOfCanGetThreads;

    data.homeBigLogo = await db.SettingModel.getHomeBigLogo();
    data.managementData = await db.SettingModel.getManagementData(data.user);
    // 公告通知
    data.noticeThreads = await db.ThreadModel.getNotice(fidOfCanGetThreads);
    // 全站精选
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);
    // 最新文章
    data.articleThreads = await db.ThreadModel.getLatestThreads(fidOfCanGetThreads);
    // 推荐文章
    data.recommendThreads = await db.ThreadModel.getRecommendThreads(fidOfCanGetThreads);
    // 用户资料补全提示
    data.improveUserInfo = await db.UserModel.getImproveUserInfoByMiddlewareUser(data.user);
    // 左侧导航数据
    data.categoriesWithForums = await db.ForumModel.getUserCategoriesWithForums({
      user: data.user,
      userRoles: data.userRoles,
      userGrade: data.userGrade,
    });
    data.subForums = await db.ForumModel.getUserSubForums(state.uid, fidOfCanGetThreads);
    await next();
  })
  .get(['/user', '/forum', '/column', '/thread'], async (ctx, next) => {
    const {data, query, db, state, internalData, nkcModules} = ctx;
    const {page = 0} = query;
    const {
      fidOfCanGetThreads
    } = internalData;
    const {type} = data;

    const columnsObj = {};
    const columnPostsObj = {};
    const subColumnPostsObj = {};
    const forumsObj = {};
    const activity = [];

    let subTid = [];
    let subUid = [];
    let subColumnId = [];
    let subForumsId = [];
    let subColumnPostsId = [];
    let subColumnPosts = [];
    const subColumnArticlesId = [];
    let subs = [];
    let count;
    let paging;
    let posts;
    const pageSettings = await db.SettingModel.getSettings('page');
    const {thread: threadType, article: articleType, post: postType} = await db.ColumnPostModel.getColumnPostTypes();

    switch(type) {
      case 'column': {
        //获取用户关注的专栏
        subColumnId = await db.SubscribeModel.getUserSubColumnsId(state.uid);
        if(subColumnId.length) {
          const columns = await db.ColumnModel.find({
            _id: {$in: subColumnId}, disabled: false, closed: false
          }, {
            _id: 1, name: 1, avatar: 1
          });
          subColumnId = [];
          for(const c of columns) {
            subColumnId.push(c._id);
            columnsObj[c._id] = c;
          }
          subColumnId = columns.map(c => c._id);
          const match = {
            columnId: {$in: subColumnId},
            hidden: false};
          const count = await db.ColumnPostModel.countDocuments(match);
          paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
          subColumnPosts = await db.ColumnPostModel.find(match, {pid: 1, columnId: 1, type: 1}).skip(paging.start).limit(paging.perpage).sort({toc: -1});
          for(const sc of subColumnPosts) {
            if(sc.type === threadType) {
              subColumnPostsId.push(sc.pid);
            } else if(sc.type === articleType) {
              subColumnArticlesId.push(sc.pid);
            }
            columnPostsObj[sc.pid] = columnsObj[sc.columnId];
            subColumnPostsObj[sc.pid] = sc;
          }
        }
        break;
      }
      case 'user': {
        subUid = await db.SubscribeModel.getUserSubUsersId(state.uid);
        break;
      }
      case 'forum': {
        subForumsId = await db.SubscribeModel.getUserSubForumsId(data.user.uid);
        const readableForumsId = await db.ForumModel.getReadableForumsIdByUid(data.user.uid);
        subForumsId = subForumsId
          .filter(fid => readableForumsId.includes(fid))
          .filter(fid => fidOfCanGetThreads.includes(fid));
        const forums = await db.ForumModel.getForumsByIdFromRedis(
          subForumsId
        );
        for(const f of forums) {
          forumsObj[f.fid] = f;
        }
        break;
      }
      case 'thread': {
        //获取用户关注的文章
        // subTid = await db.SubscribeModel.getUserSubThreadsId(state.uid, "sub");
        let m = {
          uid: state.uid,
          cancel: false,
          $or: [
            {type: 'article'}, {type: 'thread'}
          ]}
        //获取用户收藏的文章的tid
        subTid = await db.SubscribeModel.getUserSubTid(m);
        count = await db.SubscribeModel.countDocuments(m);
        paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
        subs = await db.SubscribeModel.getCollectThreadOrArticle(m, paging);
        break;
      }
    }
    const extendPost = function (post) {
      const {
        pid,
        tid,
        user,
        type,
        toc,
        url,
        title,
        content,
        cover,
        forumsId,
        quote
      } = post;


      if(user.uid !== null) user.homeUrl = nkcModules.tools.getUrl('userHome', user.uid);
      user.name = user.username;
      user.id = user.uid;
      user.dataFloatUid = user.uid;
      if(quote !== null) {
        if(quote.user.uid !== null) quote.user.homeUrl = nkcModules.tools.getUrl('userHome', quote.user.uid);
        quote.user.id = quote.user.uid;
        quote.user.name = quote.user.username;
        quote.user.dataFloatUid = quote.user.uid;
      }

      let a;
      let postType = type === 'post'? '回复': '文章'
      if(subTid.includes(tid)) {
        // 关注的文章
        a = {
          toc,
          type,
          from: `发表${postType}`,
          title,
          content,
          url,
          cover,
          user,
          quote,
        }
      } else if(subUid.includes(user.uid)) {
        // 关注的用户
        a = {
          toc,
          type,
          from: `发表${postType}`,
          title,
          content,
          cover,
          user,
          url,
          quote,
        }
      } else if(subColumnPostsId.includes(pid)) {
        const column = columnPostsObj[pid];
        const columnPost = subColumnPostsObj[pid];
        // 关注的专栏
        a = {
          toc,
          from: `添加${postType}`,
          type,
          user: {
            id: column._id,
            name: column.name,
            avatar: nkcModules.tools.getUrl("columnAvatar", column.avatar),
            homeUrl: nkcModules.tools.getUrl("columnHome", column._id),
          },
          quote: {
            user,
            title,
            content,
            cover,
            toc,
            url: nkcModules.tools.getUrl('columnThread', columnPost.columnId, columnPost._id),
          }
        }
      } else {
        // 关注的专业
        let forum;
        for(const fid of forumsId) {
          const _forum = forumsObj[fid];
          if(_forum) {
            forum = _forum;
            break;
          }
        }
        if(!forum) return;
        a = {
          toc,
          from: `添加${postType}`,
          user: {
            id: forum.fid,
            name: forum.displayName,
            avatar: forum.logo? nkcModules.tools.getUrl("forumLogo", forum.logo):null,
            homeUrl: nkcModules.tools.getUrl("forumHome", forum.fid),
            color: forum.color,
            dataFloatFid: forum.fid
          },
          quote: {
            user,
            title,
            content,
            cover,
            toc,
            url,
          }
        }
      }
      return a;
    }

    const match = {
      mainForumsId: {
        $in: fidOfCanGetThreads
      },
      recycleMark: {
        $ne: true
      },
      disabled: false,
      reviewed: true,
      toDraft: {$ne: true},
      parentPostId: '',
      $or: [
        {
          pid: {
            $in: subColumnPostsId
          },
        },
        {
          uid: {
            $in: subUid
          },
          anonymous: false,
        },
        {
          tid: {
            $in: subTid
          }
        },
        {
          mainForumsId: {
            $in: subForumsId
          },
          type: 'thread'
        }
      ]
    };
    if(type !== 'thread') {
      if(type !== 'column') {
        count = await db.PostModel.countDocuments(match);
        paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
        posts = await db.PostModel.find(match, {
          pid: 1,
          tid: 1,
          uid: 1,
          toc: 1,
          type: 1,
          c: 1,
          t: 1,
          anonymous: 1,
          cover: 1,
          mainForumsId: 1,
          columnsId: 1
        })
          .sort({toc: -1})
          .skip(paging.start)
          .limit(paging.perpage)
        posts = await db.PostModel.extendActivityPosts(posts);

        for(let i = 0; i < posts.length; i++) {
          const post = posts[i];
          const a = extendPost(post);
          activity.push(a);
        }
      } else {
        posts = await db.PostModel.find(match, {
          pid: 1,
          tid: 1,
          uid: 1,
          toc: 1,
          type: 1,
          c: 1,
          t: 1,
          anonymous: 1,
          cover: 1,
          mainForumsId: 1,
          columnsId: 1
        })
          .sort({toc: -1})
          .skip(paging.start)
          .limit(paging.perpage)
        posts = await db.PostModel.extendActivityPosts(posts);
        const postObj = {};
        const articleObj = {};
        for(const post of posts) {
          postObj[post.pid] = post;
        }
        const {normal: normalStatus} = await db.ArticleModel.getArticleStatus();
        let articles = await db.ArticleModel.find({_id: {$in: subColumnArticlesId}, status: normalStatus});
        articles = await db.ArticleModel.getArticlesInfo(articles);
        for(const article of articles) {
          articleObj[article._id] = article;
        }
        for(const sc of subColumnPosts) {
          let t;
          let thread;
          if(sc.type === threadType) {
            t = postObj[sc.pid];
            if(t) {
              thread = extendPost(t);
            }
          } else if(sc.type === articleType) {
            t = articleObj[sc.pid];
            if(t) {
              const {toc, user, document, url} = t;
              //获取当前引用的专栏信息
              const column = await sc.extendColumnPost();
              thread = {
                toc,
                form: '添加专栏文章',
                type: 'article',
                user: {
                  id: column._id,
                  name: column.name,
                  avatar: nkcModules.tools.getUrl('columnAvatar', column.avatar),
                  homeUrl: nkcModules.tools.getUrl('columnHome', column._id),
                },
                quote: {
                  user: {
                    uid: user.uid,
                    avatar: nkcModules.tools.getUrl('userAvatar', user.avatar),
                    username: user.username,
                    banned: user.certs.includes('banned'),
                    homeUrl: nkcModules.tools.getUrl('userHome', user.uid),
                    name: user.username,
                    id: user.uid,
                  },
                  title: document.title,
                  content: nkcModules.nkcRender.htmlToPlain(document.content, 200),
                  cover: nkcModules.tools.getUrl('postCover', document.cover),
                  toc: document.toc,
                  url,
                },
              };
            }
          }
          if(thread) {
            activity.push(thread);
          }
        }
      }
    } else {
      for(const sub of subs) {
        if(sub.type === 'thread') {
          const a = extendPost(sub);
          if(a) {
           activity.push(a);
          }
        } else if(sub.type === 'article') {
          const {
            toc,
            type,
            status,
            _id,
            document,
            user,
            url,
          } = sub;
          const {uid, username, avatar, id} = user;
          const {title, content, cover} = document;
          activity.push({
            toc,
            type,
            from: '发表专栏文章',
            title,
            content: nkcRender.htmlToPlain(content, 200),
            url,
            cover: nkcModules.tools.getUrl('postCover', cover),
            user: {
              uid,
              avatar: nkcModules.tools.getUrl('userAvatar', avatar),
              username,
              homeUrl: nkcModules.tools.getUrl('userHome', uid),
              id,
            }
          });
        }
      }
    }
    data.paging = paging;
    data.activity = activity;
    ctx.template = `subscribe/post.pug`;
    await next();
  })
  .use('/moment', momentRouter.routes(), momentRouter.allowedMethods())

module.exports = router;
