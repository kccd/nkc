const Router = require('koa-router');
const router = new Router();
const thread = require("./thread");
const post = require("./post");
const draft = require("./draft");
const finance = require("./finance");
const subscribeUser = require("./subscribe/user");
const follower = require("./follower");
const subscribeTopic = require("./subscribe/topic");
const subscribeDiscipline = require("./subscribe/discipline");
const subscribeColumn = require("./subscribe/column");
const subscribeThread = require("./subscribe/thread");
const subscribeForum = require('./subscribe/forum');
const subscribeCollection = require("./subscribe/collection");
const summaryPie = require("./summary/pie");
const summaryCalendar = require("./summary/calendar");
const note = require("./note");
const blacklist = require("./blacklist");
const serverConfig = require("../../../config/server.json");
router
  .use("/", async (ctx, next) => {
    const { db, data, params, state } = ctx;
    const { user, targetUser } = data;
    // 验证权限
    if (user.uid !== targetUser.uid && !ctx.permission("visitAllUserProfile")) {
      ctx.throw(403, "权限不足");
    }

    const {
      threadCount,
      postCount,
      draftCount
    } = targetUser;
    let url = ctx.url;
    url = url.replace(/\?.*/ig, "");
    url = url.replace(/\/u\/[0-9]+?\/profile\/*/ig, "");
    data.type = url;
    data.host = serverConfig.domain + ':' + serverConfig.port;
    data.subUsersId = await db.SubscribeModel.getUserSubUsersId(targetUser.uid);
    data.subTopicsId = await db.SubscribeModel.getUserSubForumsId(targetUser.uid, "topic");
    data.subDisciplinesId = await db.SubscribeModel.getUserSubForumsId(targetUser.uid, "discipline");
    data.subForumsId = data.subTopicsId.concat(data.subDisciplinesId);
    data.subColumnsId = await db.SubscribeModel.getUserSubColumnsId(targetUser.uid);
    data.subThreadsId = await db.SubscribeModel.getUserSubThreadsId(targetUser.uid, "sub");
    data.fansId = await db.SubscribeModel.getUserFansId(targetUser.uid);
    data.collectionThreadsId = await db.SubscribeModel.getUserCollectionThreadsId(targetUser.uid);
    data.targetUserScores = await db.UserModel.updateUserScores(targetUser.uid);
    if(targetUser.uid !== user.uid) {
      data.targetColumn = await db.UserModel.getUserColumn(targetUser.uid);
      data.targetColumnPermission = await db.UserModel.ensureApplyColumnPermission(targetUser.uid);
    } else {
      data.targetColumn = state.userColumn;
      data.targetColumnPermission = state.columnPermission;
    }
    const noteCount = await db.NoteContentModel.countDocuments({
      uid: targetUser.uid,
      deleted: false
    });
    data.navbar_highlight = 'profile';
    
    data.code = await db.UserModel.getCode(targetUser.uid);
    data.code = data.code.pop();
    ctx.template = "user/profile/profile.pug";
    await next();
  })
  .get("/", async (ctx, next) => {
    const { data, db } = ctx;
    const { targetUser } = data;
    // 看过的文章
    const logs = await db.UsersBehaviorModel.find({ uid: targetUser.uid, operationId: "visitThread" }, { tid: 1, timeStamp: 1 }).sort({ timeStamp: -1 }).limit(25);
    const threadsId = logs.map(l => l.tid);
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
    threads.map(t => threadsObj[t.tid] = t);
    const inserted = [];
    data.visitThreadLogs = [];
    for (let log of logs) {
      const thread = threadsObj[log.tid];
      if (thread && !inserted.includes(thread.tid)) {
        inserted.push(thread.tid);
        log = log.toObject();
        log.thread = thread;
        data.visitThreadLogs.push(log);
      }
    }
    // 看过的用户
    const visitUserlogs = await db.UsersBehaviorModel.find({ uid: targetUser.uid, operationId: "visitUserCard", toUid: { $ne: targetUser.uid } }, { uid: 1, toUid: 1, timeStamp: 1 }).sort({ timeStamp: -1 }).limit(25);
    // 看过我的用户
    const visitSelfLogs = await db.UsersBehaviorModel.find({ uid: { $nin: ["", targetUser.uid] }, operationId: "visitUserCard", toUid: targetUser.uid }, { uid: 1, toUid: 1, timeStamp: 1 }).sort({ timeStamp: -1 }).limit(25);
    let usersId = visitUserlogs.map(u => u.toUid);
    usersId = usersId.concat(visitSelfLogs.map(u => u.uid));
    const users = await db.UserModel.find({ uid: { $in: usersId } });
    const usersObj = {};
    users.map(u => usersObj[u.uid] = u);
    data.visitUserLogs = [];
    const visitUsersId = [];
    const visitSelfUsersId = [];
    data.visitSelfLogs = [];
    for (let log of visitUserlogs) {
      const user = usersObj[log.toUid];
      if (user && !visitUsersId.includes(user.uid)) {
        visitUsersId.push(user.uid);
        log = log.toObject();
        log.targetUser = user;
        data.visitUserLogs.push(log);
      }
    }
    for (let log of visitSelfLogs) {
      const user = usersObj[log.uid];
      if (user && !visitSelfUsersId.includes(user.uid)) {
        visitSelfUsersId.push(user.uid);
        log = log.toObject();
        log.user = user;
        data.visitSelfLogs.push(log);
      }
    }
    // data.numberOfOtherUserOperation = await db.UserModel.getNumberOfOtherUserOperation(targetUser.uid);
    await next();
  })
  .use("/subscribe", async (ctx, next) => {
    const { query, data, db, state } = ctx;
    let { t } = query;
    const { targetUser } = data;
    data.subscribeTypes = await db.SubscribeTypeModel.getTypesTree(targetUser.uid);
    if (t) {
      data.t = Number(t);
      loop1:
      for (const s of data.subscribeTypes) {
        if (s._id === data.t) {
          data.parentType = s;
          data.childType = undefined;
          break;
        }
        for (const c of s.childTypes) {
          if (c._id === data.t) {
            data.parentType = s;
            data.childType = c;
            break loop1;
          }
        }
      }
    }
    state.match = {};
    if (data.childType) {
      state.match.cid = data.childType._id;
    } else if (data.parentType) {
      const childTypesId = data.parentType.childTypes.map(t => t._id);
      childTypesId.push(data.parentType._id);
      state.match.cid = { $in: childTypesId };
    }
    await next();
  })
  .get("/summary/pie", summaryPie)
  .get("/summary/calendar", summaryCalendar)
  .get("/subscribe/user", subscribeUser)
  .get("/subscribe/topic", subscribeTopic)
  .get("/subscribe/forum", subscribeForum)
  .get("/subscribe/discipline", subscribeDiscipline)
  .get("/subscribe/column", subscribeColumn)
  .get("/subscribe/thread", subscribeThread)
  .get("/subscribe/collection", subscribeCollection)
  .get("/follower", follower)
  .get("/finance", finance)
  .get("/draft", draft)
  .get("/thread", thread)
  .get("/note", note)
  .get("/blacklist", blacklist)
  .get("/post", post);
module.exports = router;
