const Router = require('koa-router');
const router = new Router();
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
    }

    const homeSettings = (await db.SettingModel.findById("home")).c;

    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      user
    );

    // 排除话题下的文章
    if(!homeSettings.list || !homeSettings.list.topic) {
      const topics = await db.ForumModel.find({forumType: 'topic'}, {fid: 1});
      const fids = topics.map(t => t.fid);
      fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !fids.includes(fid));
    }
    // 排除学科下的文章
    if(!homeSettings.list || !homeSettings.list.discipline) {
      const dis = await db.ForumModel.find({forumType: 'discipline'}, {fid: 1});
      const fids = dis.map(t => t.fid);
      fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !fids.includes(fid));
    }

    data.homeSettings = homeSettings;

    // 置顶文章轮播图
    data.ads = await db.ThreadModel.getAds(fidOfCanGetThreads);
    // 网站公告
    data.noticeThreads = await db.ThreadModel.getNotice(fidOfCanGetThreads);
    // 一周活跃用户
    data.activeUsers = await db.ActiveUserModel.getActiveUsers();
    // 全站精选
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);
    let q = {};
    let threadListType;
    if(t) {
      if(!["latest", "recommend", "subscribe", "column"].includes(t)) t = '';
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
        } else {
          threadListType = "column";
        }
      } else {
        const {homeThreadList} = user.generalSettings.displaySettings;
        if(homeThreadList === "latest") {
          threadListType = "latest";
        } else if(homeThreadList === "subscribe") {
          threadListType = "subscribe";
        } else {
          threadListType = "column";
        }
      }
    }

    data.t = threadListType;
    data.navbar = {highlight: threadListType};

    // 关注的专业ID，关注的用户ID，关注的文章ID
    const subFid = [], subUid = [], subTid = [];

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
      data.subscribeTypes = await db.SubscribeTypeModel.getTypesTree(user.uid);
      let accessibleForumsId = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, user);
      accessibleForumsId = accessibleForumsId.filter(fid => fid !== "recycle");

      let subscribeType;
      if(c) {
        subscribeType = await db.SubscribeTypeModel.findOne({_id: c});
        if(!subscribeType) delete data.c;
      }
      let subscribeMatch = {
        uid: user.uid
      };
      if(subscribeType) {
        let childTypes = await db.SubscribeTypeModel.find({pid: subscribeType._id}, {_id: 1});
        childTypes = childTypes.map(t => t._id);
        childTypes.push(c);
        subscribeMatch.cid = {$in: childTypes};
      }
      if(d === "topic") {
        let topics = await db.ForumModel.find({forumType: "topic"}, {fid: 1});
        topics = topics.map(f => f.fid);
        subscribeMatch["$and"] = [
          {
            type: "forum",
            fid: {$in: topics}
          }
        ]
      } else if(d === "discipline") {
        let disciplines = await db.ForumModel.find({forumType: "discipline"}, {fid: 1});
        disciplines = disciplines.map(f => f.fid);
        subscribeMatch["$and"] = [
          {
            type: "forum",
            fid: {$in: disciplines}
          }
        ]
      } else if(d === "user") {
        subscribeMatch.type = "user";
      } else if(d === "thread") {
        subscribeMatch.type = "thread";
      }
      const subs = await db.SubscribeModel.find(subscribeMatch, {
        fid: 1,
        tid: 1,
        tUid: 1,
        type: 1
      }).sort({toc: -1});
      subs.map(s => {
        if(s.type === "forum") return subFid.push(s.fid);
        if(s.type === "thread") return subTid.push(s.tid);
        if(s.type === "user") return subUid.push(s.tUid);
      });
      q = {
        mainForumsId: {
          $in: accessibleForumsId
        },
        recycleMark: {
          $ne: true
        },
        disabled: false,
        reviewed: true,
        $or: [
          {
            mainForumsId: {
              $in: subFid
            }
          },
          {
            uid: user.uid
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
        if(subTid.includes(thread.tid)) {
          thread.from = 'subThread';
        } else if(subUid.includes(thread.uid)) {
          thread.from = 'subFriend';
        } else if(thread.uid === user.uid) {
          thread.from = 'own';
        } else {
          thread.from = 'subForum';
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

    // data.threads = threads;
    data.paging = paging;

    const activeUsers = await db.ActiveUserModel.find().sort({ vitality: -1 }).limit(12);
    data.activeUsers = await db.ActiveUserModel.extendUsers(activeUsers);
    ctx.template = "home/home.pug";
    await next();
  });
module.exports = router;
