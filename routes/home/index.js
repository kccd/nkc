const Router = require('koa-router');
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, nkcModules, db, query, state} = ctx;
    const {pageSettings} = state;
    let {page = 0, s, t} = query;
    const {user} = data;
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

    // 加载专业列表
    data.forums = await db.ForumModel.getForumsTree(data.userRoles, data.userGrade, data.user);
    // 置顶文章轮播图
    data.ads = await db.ThreadModel.getAds(fidOfCanGetThreads);
    // 网站公告
    data.noticeThreads = await db.ThreadModel.getNotice(fidOfCanGetThreads);
    // 一周活跃用户
    data.activeUsers = await db.ActiveUserModel.getActiveUsers();
    // 全站精选
    data.featuredThreads = await db.ThreadModel.getFeaturedThreads(fidOfCanGetThreads);
    if(user) {
      data.subForums = await db.ForumModel.getUserSubForums(user.uid, fidOfCanGetThreads);
    }
    let q = {};
    let threadListType;
    if(t) {
      if(!["latest", "recommend", "subscribe"].includes(t)) t = '';
      if(t === "subscribe" && !user) t = '';
      threadListType =  t;
    }
    if(!t) {
      if(!user) {
        const {visitorThreadList} = homeSettings;
        if(visitorThreadList === "latest") {
          threadListType = "latest"
        } else {
          threadListType = "recommend"
        }
      } else {
        const {homeThreadList} = user.generalSettings.displaySettings;
        if(homeThreadList === "latest") {
          threadListType = "latest";
        } else {
          threadListType = "subscribe";
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
        recycleMark: {
          $ne: true
        },
        disabled: false
      };
      if(user) {

        // 临时处理：给编辑可以看到待审核文章的权限
        if(!user.certs.includes("editor")) {
          q.$or = [
            {
              reviewed: true
            },
            {
              reviewed: false,
              uid: user.uid
            }
          ]
        }

      } else {
        q.reviewed = true;
      }
    } else if(threadListType === "subscribe") {
      const subs = await db.SubscribeModel.find({
        uid: user.uid
      }, {
        fid: 1,
        tid: 1,
        tUid: 1,
        type: 1
      }).sort({toc: -1});

      subs.map(s => {
        if(s.type === "forum") subFid.push(s.fid);
        if(s.type === "thread") subTid.push(s.tid);
        if(s.type === "user") subUid.push(s.tUid);
      });

      q = {
        mainForumsId: {
          $in: fidOfCanGetThreads
        },
        recycleMark: {
          $ne: true
        },
        disabled: false,
        $or: [
          {
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
          },
          {
            reviewed: false,
            uid: user.uid
          }
        ]
      };
    } else {
      q = await db.ThreadModel.getRecommendMatch(fidOfCanGetThreads);
    }

    const count = await db.ThreadModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count, pageSettings.homeThreadList);

    let sort = {tlm: -1};
    if(s === "toc") sort = {toc: -1};

    let threads = await db.ThreadModel.find(q, {
      uid: 1, tid: 1, toc: 1, oc: 1, lm: 1,
      tlm: 1, fid: 1, hasCover: 1,
      mainForumsId: 1, hits: 1, count: 1,
      digest: 1, reviewed: 1
    }).skip(paging.start).limit(paging.perpage).sort(sort);

    threads = await db.ThreadModel.extendThreads(threads, {
      htmlToText: true
    });

    if(threadListType === "subscribe") {
      threads.map(thread => {
        if(subTid.includes(thread.tid)) {
          thread.from = 'subThread';
        } else if(subUid.includes(thread.uid)) {
          thread.from = 'subFriend';
        } else if(thread.uid === user.uid) {
          thread.from = 'own';
        } else {
          thread.from = 'subForum';
        }
      });
    }
    /*if(user) {
      if(threadListType !== "subscribe") {
        // 加载关注的文章
        data.subscribeThreads = await db.ThreadModel.getUserSubThreads(user.uid, fidOfCanGetThreads);
      }
    }*/
    if(threadListType !== "latest") {
      data.latestThreads = await db.ThreadModel.getLatestThreads(fidOfCanGetThreads);
    }

    if(threadListType !== "recommend") {
      data.recommendThreads = await db.ThreadModel.getRecommendThreads(fidOfCanGetThreads);
    }

    data.threads = threads;
    data.paging = paging;

    const activeUsers = await db.ActiveUserModel.find().sort({ vitality: -1 }).limit(12);
    data.activeUsers = await db.ActiveUserModel.extendUsers(activeUsers);

    ctx.template = "home/newHome.pug";
    await next();
  });
module.exports = router;
