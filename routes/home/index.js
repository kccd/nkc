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
    data.ads = (await db.ThreadModel.getAds(fidOfCanGetThreads)).movable;

    // 网站公告

    data.noticeThreads = await db.ThreadModel.getNotice(fidOfCanGetThreads);
    // 一周活跃用户
    data.activeUsers = await db.ActiveUserModel.getActiveUsersFromCache();
    // 全站精选
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);

    // 最近访问的专业
    if(data.user) {
      const visitedForumsId = data.user.generalSettings.visitedForumsId.slice(0, 20);
      data.visitedForums = await db.ForumModel.getForumsByFid(visitedForumsId);
    }

    let subTid = [], subUid = [], subColumnId = [], subForumsId = [];

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
    } else if(threadListType === "subscribe") {
      if(!d) d = "all";
      if(d === "all" || d === "column") {
        subColumnId = await db.SubscribeModel.getUserSubColumnsId(data.user.uid);
        if(subColumnId.length) {
          const columns = await db.ColumnModel.find({_id: {$in: subColumnId}, disabled: false, closed: false}, {_id: 1});
          subColumnId = columns.map(c => c._id);
        }
      }
      if(d === "all" || d === "user") {
        subUid = await db.SubscribeModel.getUserSubUsersId(data.user.uid);
      }
      if(d === "all" || d === "thread") {
        subTid = await db.SubscribeModel.getUserSubThreadsId(data.user.uid, "sub");
      }
      if(d === "all" || d === "own") {
        subUid = subUid.concat(data.user.uid);
      }
      if(d === "all" || d === "reply") {
        const subTid_ = await db.SubscribeModel.getUserSubThreadsId(data.user.uid, "replay");
        subTid = subTid.concat(subTid_);
      }
      if(d === "forum" || d === "all") {
        subForumsId = await db.SubscribeModel.getUserSubForumsId(data.user.uid);
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
        $or: [
          {
            columnsId: {$in: subColumnId}
          },
          {
            uid: {
              $in: subUid
            }
          },
          {
            tid: {
              $in: subTid
            }
          },
          {
            mainForumsId: {
              $in: subForumsId
            }
          }
        ]
      };
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
    let paging;

    const count = await db.ThreadModel.count(q);
    paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);
    let sort = {tlm: -1};
    if(s === "toc") sort = {toc: -1};
    let threads = await db.ThreadModel.find(q, {
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
        if(data.user.uid === thread.tid) {
          thread.from = "own";
        } else if(subTid.includes(thread.tid)) {
          thread.from = 'subThread';
        } else if(subUid.includes(thread.uid)) {
          thread.from = 'subFriend';
        } else {
          thread.from = "subColumn";
        }
      }
      data.threads.push(thread);
    }
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
        mainForumsId: {$ne: "recycle"}
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
    data.paging = paging;
    ctx.template = "home/home.pug";
    await next();
  });
module.exports = router;
