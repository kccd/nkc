const { OnlyUser } = require('../../middlewares/permission');

const router = require('koa-router')();
const visit = async (ctx, next) => {
  const { data, db, nkcModules } = ctx;
  const { uid } = ctx.state;
  const { visitedUsers, accessedUsers, visitedThreads } =
    await db.UsersGeneralModel.findOne(
      { uid },
      {
        visitedUsers: 1,
        accessedUsers: 1,
        visitedThreads: 1,
      },
    );
  const usersLog = visitedUsers.concat(accessedUsers);
  const usersId = usersLog.map((u) => u._id);
  const usersObj = await db.UserModel.getUsersObjectByUsersId(usersId);
  const visitUserLogs = [];
  const visitSelfLogs = [];
  for (const l of visitedUsers) {
    const { _id, time } = l;
    if (!_id) continue;
    const user = usersObj[_id];
    visitUserLogs.push({
      uid: user.uid,
      username: user.username,
      avatarUrl: nkcModules.tools.getUrl('userAvatar', user.avatar),
      userHome: nkcModules.tools.getUrl('userHome', user.uid),
      time: nkcModules.tools.fromNow(time),
    });
  }
  for (const l of accessedUsers) {
    const { _id, time } = l;
    if (!_id) continue;
    const user = usersObj[_id];
    visitSelfLogs.push({
      uid: user.uid,
      username: user.username,
      avatarUrl: nkcModules.tools.getUrl('userAvatar', user.avatar),
      userHome: nkcModules.tools.getUrl('userHome', user.uid),
      time: nkcModules.tools.fromNow(time),
    });
  }
  const threadsId = visitedThreads.map((t) => t._id);
  let threads = await db.ThreadModel.find({ tid: { $in: threadsId } });
  threads = await db.ThreadModel.extendThreads(threads, {
    forum: false,
    category: false,
    firstPost: true,
    firstPostUser: true,
    userInfo: false,
    lastPost: false,
    lastPostUser: false,
    firstPostResource: false,
    htmlToText: false,
    count: 200,
    showAnonymousUser: false,
    excludeAnonymousPost: false,
  });
  const threadsObj = {};
  threads.map((t) => (threadsObj[t.tid] = t));
  const inserted = [];
  const visitThreadLogs = [];
  for (let log of visitedThreads) {
    if (!log._id) continue;
    const thread = threadsObj[log._id];
    if (thread && !inserted.includes(thread.tid)) {
      inserted.push(thread.tid);
      visitThreadLogs.push({
        thread,
        time: nkcModules.tools.fromNow(log.time),
      });
    }
  }

  data.visitUserLogs = visitUserLogs.reverse();
  data.visitSelfLogs = visitSelfLogs.reverse();
  data.visitThreadLogs = visitThreadLogs;
  (await next) && next();
};
const active = async (ctx, next) => {
  const { db, data } = ctx;
  const { uid } = ctx.state;

  data.pie = await db.UserModel.getUserPostSummary(uid);
  (await next) && next();
};
const calendar = async (ctx, next) => {
  const { db, data, query } = ctx;
  const { uid } = ctx.state;
  let { year = new Date().getFullYear() } = query;
  const posts = await db.PostModel.aggregate([
    {
      $match: {
        uid,
        toc: {
          $gte: new Date(`${year}-1-1 00:00:00`),
          $lt: new Date(`${year + 1}-1-1 00:00:00`),
        },
      },
    },
    {
      $project: {
        _id: 0,
        time: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$toc',
          },
        },
      },
    },
    {
      $group: {
        _id: '$time',
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  data.posts = posts || [];
  (await next) && next();
};
router
  .get('/calendar', OnlyUser(), calendar)
  // 活跃领域
  .get('/active', OnlyUser(), active)
  .get('/visit', OnlyUser(), visit)
  // 获取三个数据统一返回
  .get('/data', OnlyUser(), async (ctx, next) => {
    await visit(ctx);
    await active(ctx);
    await calendar(ctx);
    await next();
  });
module.exports = router;
