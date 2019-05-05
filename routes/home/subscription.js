const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {db, data, query, nkcModules} = ctx;
    const {page = 0} = query;
    const {user} = data;
    const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user
    );
    // 获取关注的文章ID
    const usersCollections = await db.CollectionModel.find({uid: user.uid});
    const subscribeThreadsId = usersCollections.map(c => c.tid);
    // 获取全部好友ID
    const friends = await db.FriendModel.find({uid: user.uid});
    const friendsId = friends.map(f => f.tUid);
    // 获取用户关注的专业ID
    const userSubscribe = await db.UsersSubscribeModel.findOne({uid: user.uid});
    const subscribeForums = userSubscribe.subscribeForums;
    let subscribeForumsId = [];
    for(const fid of subscribeForums) {
      subscribeForumsId.push(fid);
      const childFid = await db.ForumModel.getAllChildrenFid(fid);
      subscribeForumsId = subscribeForumsId.concat(childFid);
    }
    const q = {
      fid: {
        $in: fidOfCanGetThreads
      },
      $or: [
        {
          // 关注的专业
          fid: {
            $in: subscribeForumsId
          }
        },
        {
          // 自己的文章
          uid: user.uid
        },
        {
          // 好友的文章
          uid: {
            $in: friendsId
          }
        },
        {
          // 关注的文章
          tid: {
            $in: subscribeThreadsId
          }
        }
      ]
    };

    const count = await db.ThreadModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    let threads = await db.ThreadModel.find(
      q,
      {
        uid: 1, tid: 1, toc: 1, oc: 1, lm: 1, tlm: 1, fid: 1, hasCover: 1,
        mainForumsId: 1
      }).skip(paging.start).limit(paging.perpage).sort({tlm: -1}
    );
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
    const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
    // 置顶文章轮播图
    const ads = await Promise.all(homeSettings.c.ads.map(async tid => {
      const thread = await db.ThreadModel.findOne({tid});
      if(thread) return thread;
    }));
    data.ads = await db.ThreadModel.extendThreads(ads, {
      forum: false,
      lastPost: false
    });
    // 专业分类
    const threadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
    let forums = await db.ForumModel.visibleForums(data.userRoles, data.userGrade, data.user);
    forums = nkcModules.dbFunction.forumsListSort(forums, threadTypes);
    data.forums = forums.map(forum => forum.toObject?forum.toObject(): forum);
    // 一周活跃用户
    const { home } = ctx.settings;
    const activeUsers = await db.ActiveUserModel.find().sort({ vitality: -1 }).limit(home.activeUsersLength);
    data.activeUsers = await db.ActiveUserModel.extendUsers(activeUsers);
    // 网站公告
    const noticeThreads = await Promise.all(homeSettings.c.noticeThreadsId.map(async oc => {
      const thread = await db.ThreadModel.findOne({oc});
      if(thread) return thread;
    }));
    data.noticeThreads = await db.ThreadModel.extendThreads(noticeThreads, {
      forum: false,
      lastPost: false
    });
    data.threads = threads;
    data.paging = paging;
    ctx.template = 'home/subscription.pug';
    await next();
  });
module.exports = router;