const router = require("koa-router")();
const home = require("./home");
const redisClient = require("../../settings/redisClient");
router
  .get("/", async (ctx, next) => {
    const {data, nkcModules, db, query, state} = ctx;
    const {pageSettings} = state;
    let {page = 0, s, t, c, d} = query;
    const {user} = data;
    data.c = c;
    data.d = d;
    data.latestToppedThreads = [];
    if(s) data.s = s;
    if(user) {
      // 日常登陆
      const lock = await nkcModules.redLock.lock(`dailyLogin:${user.uid}`, 10000);
      await ctx.db.KcbsRecordModel.insertSystemRecord('dailyLogin', ctx.data.user, ctx);
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
      try{
        await lock.unlock();
      } catch(err) {
        console.log(err.message.red);
      }
    }
    const homeSettings = await db.SettingModel.getSettings("home");
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
      if(!["latest", "recommend", "subscribe", "column", "home"].includes(t)) t = '';
      if(t === "subscribe" && !user) t = '';
      threadListType =  t;
    }
    if(!t) {
      if(!user) {
        const {visitorThreadList} = homeSettings;
        if(visitorThreadList === "latest") {
          threadListType = "latest"
        } else if(visitorThreadList === "recommend") {
          threadListType = "recommend"
        } else if(visitorThreadList === "home"){
          threadListType = "home";
        } else {
          threadListType = "column";
        }
      } else {
        const {homeThreadList} = user.generalSettings.displaySettings;
        if(homeThreadList === "latest") {
          threadListType = "latest";
        } else if(homeThreadList === "subscribe") {
          threadListType = "subscribe";
        } else if(homeThreadList === "home") {
          threadListType = "home";
        } else {
          threadListType = "column";
        }
      }
    }

    data.t = threadListType;
    data.navbar = {highlight: threadListType};

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
    data.homeBigLogo = await db.AttachmentModel.getHomeBigLogo();
    // 置顶文章轮播图
    data.ads = (await db.ThreadModel.getHomeRecommendThreads(fidOfCanGetThreads)).movable;

    // 网站公告

    data.noticeThreads = await db.ThreadModel.getNotice(fidOfCanGetThreads);
    // 一周活跃用户
    data.activeUsers = await db.ActiveUserModel.getActiveUsersFromCache();
    // 全站精选
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);

    // 最近访问的专业
    if(data.user) {
      const visitedForumsId = data.user.generalSettings.visitedForumsId.slice(0, 5);
      data.visitedForums = await db.ForumModel.getForumsByFid(visitedForumsId);
    }

    let subTid = [], subUid = [], subColumnId = [], subForumsId = [], subColumnPostsId = [];
    let paging;

    if(threadListType === "latest") {
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

      const count = await db.PostModel.count(q);
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
        if(subTid.includes(tid)) {
          // 关注的文章
          a = {
            toc,
            from: 'thread',
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
            from: 'user',
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
            from: 'column',
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
            from: 'forum',
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
    if(threadListType !== 'subscribe') {
      const count = await db.ThreadModel.count(q);
      paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
      let sort = {tlm: -1};
      if(s === "toc") sort = {toc: -1};
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
        htmlToText: true
      });
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
      if(threadListType !== "latest") {
        data.latestThreads = await db.ThreadModel.getLatestThreads(fidOfCanGetThreads);
      }

      if(threadListType !== "recommend") {
        data.recommendThreads = await db.ThreadModel.getRecommendThreads(fidOfCanGetThreads);
      }
      if(ctx.permission("complaintGet")) {
        data.unResolvedComplaintCount = await db.ComplaintModel.count({resolved: false});
      }
      if(ctx.permission("visitProblemList")) {
        data.unResolvedProblemCount = await db.ProblemModel.count({resolved: false});
      }
      if(ctx.permission("review")) {
        const q = {
          reviewed: false,
          disabled: false,
          mainForumsId: {$ne: recycleId}
        };
        if(!ctx.permission("superModerator")) {
          const forums = await db.ForumModel.find({moderators: data.user.uid}, {fid: 1});
          const fid = forums.map(f => f.fid);
          q.mainForumsId = {
            $in: fid
          }
        }
        const posts = await db.PostModel.find(q, {tid: 1, pid: 1});
        const threads = await db.ThreadModel.find({tid: {$in: posts.map(post => post.tid)}}, {recycleMark: 1, oc: 1, tid: 1});
        const threadsObj = {};
        threads.map(thread => threadsObj[thread.tid] = thread);
        let count = 0;
        posts.map(post => {
          const thread = threadsObj[post.tid];
          if(thread && (thread.oc !== post.pid || !thread.recycleMark)) {
            count++;
          }
        });
        data.unReviewedCount = count;
      }
    }
    data.paging = paging;

    // 是否启用了基金
    const fundSettings = await db.SettingModel.getSettings('fund');
    // const fundSettings = await db.SettingModel.findOne({_id: 'fund'});
    let enableFund = fundSettings.enableFund;
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
    data.enableFund = enableFund;
    // 是否启用了网站工具
    const toolSettings = await db.SettingModel.getSettings("tools");
    data.siteToolEnabled = toolSettings.enabled;
    // 是否显示“活动”入口
    data.showActivityEnter = homeSettings.showActivityEnter;
    ctx.template = "home/home.pug";
    await next();
  });
module.exports = router;
