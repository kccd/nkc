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

    // 加载专业列表
    data.forums = await db.ForumModel.getForumsTree(data.userRoles, data.userGrade, data.user);

    // 关注的文章
    const usersCollections = await db.CollectionModel.find({uid: user.uid});
    const subscribeThreadsId = usersCollections.map(c => c.tid);

    // 好友
    const friends = await db.FriendModel.find({uid: user.uid});
    const friendsId = friends.map(f => f.tUid);

    // 关注的专业
    const userSubscribe = await db.UsersSubscribeModel.findOne({uid: user.uid});
    const subscribeForums = userSubscribe.subscribeForums;
    let subscribeForumsId = [];
    for(const fid of subscribeForums) {
      subscribeForumsId.push(fid);
      const childFid = await db.ForumModel.getAllChildrenFid(fid);
      subscribeForumsId = subscribeForumsId.concat(childFid);
    }

    const homeSettings = (await db.SettingModel.findById("home")).c;

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
      $or: [
        {
          fid: {
            $in: subscribeForumsId
          }
        },
        {
          uid: user.uid
        },
        {
          uid: {
            $in: friendsId
          }
        },
        {
          tid: {
            $in: subscribeThreadsId
          }
        }
      ]
    };

    const count = await db.ThreadModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);

    let threads = await db.ThreadModel.find(q, {
      uid: 1, tid: 1, toc: 1, oc: 1, lm: 1,
      tlm: 1, fid: 1, hasCover: 1,
      mainForumsId: 1
    }).skip(paging.start).limit(paging.perpage).sort({toc: -1});

    threads = await db.ThreadModel.extendThreads(threads, {
      htmlToText: true
    });

    threads.map(thread => {
      if(subscribeThreadsId.includes(thread.tid)) {
        thread.type = 'subscribeThread';
      } else if(friendsId.includes(thread.uid)) {
        thread.type = 'subscribeFriend';
      } else if(thread.uid === user.uid) {
        thread.type = 'own';
      } else {
        thread.type = 'subscribeForum';
      }
    });

    data.threads = threads;

    ctx.template = "home/newHome.pug";



    await next();
  })
  .use('subscription', subscriptionRouter.routes(), subscriptionRouter.allowedMethods());
module.exports = router;