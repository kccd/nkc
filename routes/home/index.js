const Router = require('koa-router');
const router = new Router();
const subscriptionRouter = require('./subscription');
router
  .get("/", async (ctx, next) => {
    const {data, db, nkcModules, query} = ctx;
    const {user} = data;
    const {page=0} = query;

    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user
    );

    if(!user) {
      return ctx.redirect("/login");
    }

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

    const homeSettings = (await db.SettingModel.findById("home")).c;

    // 加载专业列表
    data.forums = await db.ForumModel.getForumsTree(data.userRoles, data.userGrade, data.user);

    // 置顶文章轮播图
    const ads = await Promise.all(homeSettings.ads.map(async tid => {
      const thread = await db.ThreadModel.findOne({tid});
      if(thread) return thread;
    }));

    data.ads = await db.ThreadModel.extendThreads(ads, {
      forum: false,
      lastPost: false
    });

    // 关注

    const subs = await db.SubscribeModel.find({
      uid: user.uid
    }, {
      fid: 1,
      tid: 1,
      tUid: 1,
      type: 1
    }).sort({toc: -1});

    // 关注的专业ID，关注的用户ID，关注的文章ID
    const subFid = [], subUid = [], subTid = [];

    subs.map(s => {
      if(s.type === "forum") subFid.push(s.fid);
      if(s.type === "thread") subTid.push(s.tid);
      if(s.type === "user") subUid.push(s.tUid);
    });

    data.homeSettings = homeSettings;

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

    const q = {
      mainForumsId: {
        $in: fidOfCanGetThreads
      },
      recycleMark: {
        $ne: true
      },
      disabled: false,
      $or: [
        {
          fid: {
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

    const count = await db.ThreadModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);

    let threads = await db.ThreadModel.find(q, {
      uid: 1, tid: 1, toc: 1, oc: 1, lm: 1,
      tlm: 1, fid: 1, hasCover: 1,
      mainForumsId: 1, hits: 1, count: 1
    }).skip(paging.start).limit(paging.perpage).sort({toc: -1});

    threads = await db.ThreadModel.extendThreads(threads, {
      htmlToText: true
    });

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

    // 一周活跃用户
    const { home } = ctx.settings;
    const activeUsers = await db.ActiveUserModel.find().sort({ vitality: -1 }).limit(home.activeUsersLength);
    data.activeUsers = await db.ActiveUserModel.extendUsers(activeUsers);
    // 网站公告
    const noticeThreads = await Promise.all(homeSettings.noticeThreadsId.map(async oc => {
      const thread = await db.ThreadModel.findOne({oc});
      if(thread) return thread;
    }));
    data.noticeThreads = await db.ThreadModel.extendThreads(noticeThreads, {
      forum: false,
      lastPost: false
    });

    data.threads = threads;
    data.paging = paging;

    ctx.template = "home/newHome.pug";

    await next();
  })
  .use('subscription', subscriptionRouter.routes(), subscriptionRouter.allowedMethods());
module.exports = router;