const router = require("koa-router")();
const home = require("./home");
const reply = require('./reply');
const thread = require('./thread');
const column = require('./column');
router
  // 更新用户日常登录记录
  .get('/', async (ctx, next) => {
    const {data, state, nkcModules, db} = ctx;
    const {user} = data;
    if(state.uid) {
      const lock = await nkcModules.redLock.lock(`dailyLogin:${state.uid}`, 5000);
      try{
        await ctx.db.KcbsRecordModel.insertSystemRecord('dailyLogin', user, ctx);
        const {today} = nkcModules.apiFunction;
        const time = today();
        const dailyLogin = await db.UsersScoreLogModel.findOne({
          uid: user.uid,
          type: 'score',
          operationId: 'dailyLogin',
          toc: {
            $gte: time
          }
        });
        if(!dailyLogin) {
          await db.UserModel.updateUserKcb(user.uid);
          await db.UsersScoreLogModel.insertLog({
            user,
            type: 'score',
            typeIdOfScoreChange: 'dailyLogin',
            port: ctx.port,
            ip: ctx.address,
            key: 'dailyLoginCount'
          });
          await user.updateUserMessage();
        }
      } catch(err) {}
      await lock.unlock();
    }
    await next();
  })
  .get('/cp', async (ctx, next) => {
    const {query, data, db, internalData} = ctx;
    const {t = 'home'} = query;
    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user
    );
    // 筛选出没有开启流控的专业
    let forumInReduceVisits = await db.ForumModel.find({openReduceVisits: true}, {fid: 1});
    forumInReduceVisits = forumInReduceVisits.map(forum => forum.fid);
    fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !forumInReduceVisits.includes(fid));
    internalData.fidOfCanGetThreads = fidOfCanGetThreads;
    if(t === 'reply') {
      return reply(ctx, next);
    } else if(t === 'thread') {
      return thread(ctx, next);
    } else if(t === 'column') {
      return column(ctx, next);
    } else {
      return home(ctx, next);
    }
  })
  .get("/", async (ctx, next) => {
    const {data, nkcModules, db, query, state} = ctx;
    const {pageSettings} = state;
    let {page = 0, s, t, c, d} = query;
    const {user} = data;
    data.c = c;
    data.d = d;
    data.latestToppedThreads = [];
    if(s) data.s = s;
    const homeSettings = await db.SettingModel.getSettings("home");
    const latestFirst = homeSettings.latestFirst;
    data.latestFirst = latestFirst;
    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      user
    );

    const recycleId = await db.SettingModel.getRecycleId();

    // 筛选出没有开启流控的专业
    let forumInReduceVisits = await db.ForumModel.find({openReduceVisits: true});
    forumInReduceVisits = forumInReduceVisits.map(forum => forum.fid);
    fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !forumInReduceVisits.includes(fid));

    let q = {};
    let threadListType;
    if(t) {
      if(!["reply", "recommend", "subscribe", "column", "home", "thread"].includes(t)) t = latestFirst;
      if(t === "subscribe" && !user) t = '';
      threadListType =  t;
    }
    if(!t) {
      threadListType = 'home';
    }

    data.t = threadListType;
    data.navbar = {highlight: threadListType};

    // 管理面板需要的数据
    data.managementData = await db.SettingModel.getManagementData(user);


    if(threadListType === "home") {
      await home({
        ctx, fidOfCanGetThreads
      });
      return await next();
    }

    const topicsId = await db.ForumModel.getForumsIdFromRedis("topic");
    const disciplinesId = await db.ForumModel.getForumsIdFromRedis("discipline");

    // 排除话题下的文章
    if(!homeSettings.list || !homeSettings.list.topic) {
      fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !topicsId.includes(fid));
    }
    // 排除学科下的文章
    if(!homeSettings.list || !homeSettings.list.discipline) {
      fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !disciplinesId.includes(fid));
    }
    data.homeSettings = homeSettings;
    data.homeBigLogo = await db.SettingModel.getHomeBigLogo();
    // 置顶文章轮播图
    data.ads = (await db.ThreadModel.getHomeRecommendThreads(fidOfCanGetThreads)).movable;

    // 网站公告

    data.noticeThreads = await db.ThreadModel.getNotice(fidOfCanGetThreads);
    // 一周活跃用户
    // data.activeUsers = await db.ActiveUserModel.getActiveUsersFromCache();
    // 新用户
    data.newUsers = await db.ActiveUserModel.getNewUsersFromCache();
    // 全站精选
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);

    // 最近访问的专业
    if(data.user) {
      let visitedForumsId = await db.UsersGeneralModel.getUserVisitedForumsId(data.user.uid);
      visitedForumsId = visitedForumsId.slice(0, 5);
      data.visitedForums = await db.ForumModel.getForumsByFid(visitedForumsId);
      data.subForums = await db.ForumModel.getUserSubForums(data.user.uid, fidOfCanGetThreads);
    }

    let subTid = [], subUid = [], subColumnId = [], subForumsId = [], subColumnPostsId = [];
    let paging;

    if(threadListType === "reply") {
      q = {
        type: {$in: ['post', 'thread']}
      };
      const count = await db.PostModel.countDocuments(q);
      paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
      let posts = await db.PostModel.find(q).sort({toc: -1})
        .skip(paging.start)
        .limit(paging.perpage);
      const parentPostsId = [];
      const newPosts = [];
      const quotePostsIdObj = {};
      for(let i = 0; i < posts.length; i++) {
        const post = posts[i];
        if(
          post.reviewed === false ||
          post.disabled === true ||
          post.toDraft === true
        ) continue;
        //全站精选
        const _fidOfCanGetThreads = new Set(fidOfCanGetThreads).size;
        const _mainForumsId = new Set(post.mainForumsId).size;
        const allForumsId = fidOfCanGetThreads.concat(post.mainForumsId);
        const _allForumsId = new Set(allForumsId).size;
        if(_fidOfCanGetThreads + _mainForumsId === _allForumsId) {
          continue;
        }
        //获取用户父级postId的post
        if(post.parentPostId) {
          parentPostsId.push(post.parentPostId);
        }
        //获取引用的回复
        if(post.quote) {
          const [quotePostId] = post.quote.split(':');
          quotePostsIdObj[post.pid] = quotePostId;
          parentPostsId.push(quotePostId);
        }
        newPosts.push(post);
      }
      posts = newPosts;
      posts = await db.PostModel.extendActivityPosts(posts);
      const parentPosts = await db.PostModel.find({
        mainForumsId: {$in: fidOfCanGetThreads},
        reviewed: true,
        toDraft: {$ne: true},
        disabled: false,
        pid: {$in: parentPostsId}
      }, {
        pid: 1,
        uid: 1,
        toc: 1,
        c: 1,
        anonymous: 1
      });
      const parentPostsObj = {};
      const usersObj = {};

      const usersId = [];
      for(let i = 0; i < parentPosts.length; i++) {
        const {uid, pid, anonymous} = parentPosts[i];
        parentPostsObj[pid] = parentPosts[i];
        if(anonymous) continue;
        usersId.push(uid);
      }
      const users = await db.UserModel.find({uid: {$in: usersId}}, {
        username: 1,
        uid: 1,
        avatar: 1
      });
      for(let i = 0; i < users.length; i++) {
        const {uid} = users[i];
        users[i].avatar = nkcModules.tools.getUrl('userAvatar', users[i].avatar);
        usersObj[uid] = users[i];
      }

      let anonymousUser = nkcModules.tools.getAnonymousInfo();
      anonymousUser = {
        uid: null,
        username: anonymousUser.username,
        avatar: anonymousUser.avatarUrl,
      };
      for(let i = 0; i < posts.length; i ++) {
        const post = posts[i];
        const quotePostId = quotePostsIdObj[post.pid];
        const parentPostId = quotePostId || post.parentPostId;
        let parentPost = null;
        if(parentPostId) {
          const originPost = parentPostsObj[parentPostId];
          if(!originPost) continue;
          let user = usersObj[originPost.uid];
          if(!user) {
            user = anonymousUser;
          }
          parentPost = {
            toc: originPost.toc,
            url: nkcModules.tools.getUrl('post', originPost.pid),
            content: nkcModules.nkcRender.htmlToPlain(originPost.c, 200),
            user: {
              uid: user.uid,
              avatar: user.avatar,
              username: user.username,
            },
          };
        }
        if(parentPost && parentPost.user.uid) {
          parentPost.user.homeUrl = nkcModules.tools.getUrl('userHome', parentPost.user.uid);
        }
        post.parentPost = parentPost;
      }
      data.posts = posts;
    } else if(threadListType === "thread") {
      q = {
        mainForumsId: {
          $in: fidOfCanGetThreads
        },
        /*recycleMark: {
          $ne: true
        },
        disabled: false*/
      };

      if(user) {
        if(!ctx.permission("superModerator")) {
          const canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
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
      // 最新页置顶文章
      data.latestToppedThreads = await db.ThreadModel.getLatestToppedThreads(fidOfCanGetThreads);

    } else if(threadListType === "subscribe") {
      const columnsObj = {};
      const columnPostsObj = {};
      const forumsObj = {};
      if(!d) d = "all";
      if(d === "all" || d === "column") {
        //获取关注的专栏id
        subColumnId = await db.SubscribeModel.getUserSubColumnsId(data.user.uid);
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
          //查找专栏文章引用
          const subColumnPosts = await db.ColumnPostModel.find({columnId: {$in: subColumnId}, hidden: false}, {pid: 1, columnId: 1});
          for(const sc of subColumnPosts) {
            subColumnPostsId.push(sc.pid);
            columnPostsObj[sc.pid] = columnsObj[sc.columnId];
          }
        }
      }
      if(d === "all" || d === "user") {
        subUid = await db.SubscribeModel.getUserSubUsersId(data.user.uid);
      }
      if(d === "all" || d === "thread") {
        subTid = await db.SubscribeModel.getUserSubThreadsId(data.user.uid, "sub");
      }
      if(d === "forum" || d === "all") {
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
      }

      q = {
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
      const count = await db.PostModel.countDocuments(q);
      paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
      let posts = await db.PostModel.find(q, {
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
        columnsId: 1,
      })
        .sort({toc: -1})
        .skip(paging.start)
        .limit(paging.perpage)

      posts = await db.PostModel.extendActivityPosts(posts);

      const activity = [];
      for(const post of posts) {
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
              url,
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
          if(!forum) continue;
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
        activity.push(a);
      }
      data.activity = activity;
      if(data.user) {
        data.subColumns = await db.SubscribeModel.getUserSubColumns(data.user.uid);
      }
    } else if(threadListType === "recommend") {
      q = await db.ThreadModel.getRecommendMatch(fidOfCanGetThreads);
    } else if(threadListType === "column"){
      q = {
        mainForumsId: {
          $in: fidOfCanGetThreads
        },
        recycleMark: {
          $ne: true
        },
        disabled: false,
        reviewed: true,
        inColumn: true
      }
    }
    data.threads = [];
    let threads = [];
    if(threadListType !== 'subscribe' && threadListType !== 'reply') {
      const count = await db.ThreadModel.countDocuments(q);
      paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
      let sort = {tlm: -1};
      if(s === "toc" || threadListType === 'column') sort = {toc: -1};
      if(threadListType === "recommend") sort= {toc : -1};
      let forum;
      if(threadListType === 'column') {
        forum = false;
        const tidArr = [];
        const aidArr = [];
        const {thread: threadType, article: articleType} = await db.ColumnPostModel.getColumnPostTypes();
        //查找文章专栏引用
        const columnPosts = await db.ColumnPostModel.find({type: {$in: [threadType, articleType]}, hidden: false}).skip(paging.start).limit(paging.perpage).sort(sort);
        for(const c of columnPosts) {
          if(c.type === threadType) {
            tidArr.push(c.pid);
          } else if(c.type === articleType) {
            aidArr.push(c.pid);
          }
        }
        q.oc = {
          $in: tidArr,
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
        const {normal: normalStatus} = await db.ArticleModel.getArticleStatus();
        let columnArticles = await db.ArticleModel.find({_id: {$in: aidArr}});
        columnArticles = await db.ColumnPostModel.extendColumnArticles(columnArticles);
        const articleObj = {};
        for(const ca of columnArticles) {
          articleObj[ca._id] = ca;
        }
        columnThreads = await db.ThreadModel.extendThreads(columnThreads, {
          htmlToText: true,
          removeLink: true,
          forum,
          extendColumns: t === 'column'?true:false
        });
        const threadObj = {};
        for(const thread of columnThreads) {
          if(thread) {
            threadObj[thread.oc] = thread;
          }
        }
        threads = [];
        for(const c of columnPosts) {
          let t;
          if(c.type === threadType) {
            t = threadObj[c.pid];
            if(t) t.type = 'article';
          } else if(c.type === articleType){
            t = articleObj[c.pid];
            if(t) {
              //获取当前引用的专栏
              const column = await c.extendColumnPost();
              t.type = 'newArticle';
              t.document.content = nkcModules.nkcRender.htmlToPlain(t.document.content, 200),
              //获取文章的专栏信息
              t.columns= [column];
            }
          }
          if(t) {
            t.url = `/m/${c.columnId}/a/${c._id}`;
            threads.push(t);
          }
        }
      } else {
        forum = true;
        threads = await db.ThreadModel.find(q, {
          uid: 1, tid: 1, toc: 1, oc: 1, lm: 1,
          tlm: 1, fid: 1, hasCover: 1,
          mainForumsId: 1, hits: 1, count: 1,
          digest: 1, reviewed: 1,
          columnsId: 1,
          categoriesId: 1,
          disabled: 1, recycleMark: 1
        }).skip(paging.start).limit(paging.perpage).sort(sort);
        threads = await db.ThreadModel.extendThreads(threads, {
          htmlToText: true,
          removeLink: true,
          forum,
          extendColumns: t === 'column'?true:false
        });
      }
    }
    const superModerator = ctx.permission("superModerator");
    let canManageFid = [];
    if(user) {
      canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
    }
    for(const thread of threads) {
      if(thread.disabled || thread.recycleMark) {
        // 根据权限过滤掉 屏蔽、退修的内容
        if (user) {
          // 不具有特殊权限且不是自己
          if (!superModerator) {
            const mainForumsId = thread.mainForumsId;
            let has = false;
            for (const fid of mainForumsId) {
              if (canManageFid.includes(fid)) {
                has = true;
              }
            }
            if (!has) continue;
          }
        } else {
          continue;
        }
      }

      if(threadListType === "subscribe") {
        if(data.user.uid === thread.uid) {
          thread.from = "own";
        } else if(subTid.includes(thread.tid)) {
          thread.from = 'subThread';
        } else if(subUid.includes(thread.uid)) {
          thread.from = 'subFriend';
        } else {
          let inSubColumnId = false;
          for(const columnId of thread.columnsId) {
            if(!subColumnId.includes(columnId)) continue;
            inSubColumnId = true;
          }
          if(inSubColumnId) {
            thread.from = 'subColumn';
          } else {
            thread.from = 'subForum';
          }
        }
      }
      data.threads.push(thread);
    }

    if(!state.isApp) {
      if(threadListType !== "thread") {
        data.articleThreads = await db.ThreadModel.getLatestThreads(fidOfCanGetThreads);
      }

      if(threadListType !== "recommend") {
        data.recommendThreads = await db.ThreadModel.getRecommendThreads(fidOfCanGetThreads);
      }
    }
    data.paging = paging;

    // 是否启用了基金
    const fundSettings = await db.SettingModel.getSettings('fund');
    const enableFund = fundSettings.enableFund;
    if(enableFund) {
      // 基金名称
      data.fundName = fundSettings.fundName;
      // 基金申请
      const queryOfFunding = {
        disabled: false,
        'status.adminSupport': true,
        'status.completed': {$ne: true}
      };
      const funding = await db.FundApplicationFormModel.find(queryOfFunding).sort({toc: -1}).limit(5);
      data.fundApplicationForms = [];
      for(const a of funding) {
        await a.extendFund();
        if(a.fund) {
          await a.extendApplicant({
            extendSecretInfo: false
          });
          await a.extendProject();
          data.fundApplicationForms.push(a);
        }
      }
    }
    data.appsData = await db.SettingModel.getAppsData();
    data.improveUserInfo = await db.UserModel.getImproveUserInfoByMiddlewareUser(data.user);
    data.categoriesWithForums = await db.ForumModel.getUserCategoriesWithForums({
      user: data.user,
      userRoles: data.userRoles,
      userGrade: data.userGrade,
    });
    ctx.template = "home/home.pug";
    await next();
  });
module.exports = router;
