const Router = require('koa-router');
const messageRouter = new Router();
const systemInfoRouter = require('./systemInfo');
const remindRouter = require('./remind');
const userRouter = require('./user');
const resourceRouter = require('./resource');
const settingsRouter = require('./settings');
messageRouter
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    const from = ctx.request.get('FROM');
    if(from !== 'nkcAPI') {
      data.targetUid = query.uid;
      user.newMessage = {};
      ctx.template = 'message/message.pug';
      return await next();
    }
    const uidList = await db.MessageModel.getUsersFriendsUid(user.uid);
    const userList = [];
    for(const uid of uidList) {
      const targetUser = await db.UserModel.findOne({uid});
      if(!targetUser) continue;
      const latestMessage = await db.MessageModel.findOne({
        $or: [
          {
            r: targetUser.uid,
            s: user.uid
          },
          {
            s: targetUser.uid,
            r: user.uid
          }
        ]
      }).sort({tc: -1});
      const newMessageCount = await db.MessageModel.count({
        r: user.uid,
        s: targetUser.uid,
        vd: false
      });
      userList.push({
        user: targetUser,
        latestMessage,
        newMessageCount
      });
    }

    const userListArr = [];
    const userListTocArr = [];

    for(let i = 0; i < userList.length; i++) {
      const list = userList[i];
      const tc = new Date(list.latestMessage.tc).getTime();
      if(userListTocArr.length === 0) {
        userListTocArr.push(tc);
        userListArr.push(list);
        uidList.push(list.user.uid);
        continue;
      }
      let insert = false;
      const length = userListTocArr.length;
      for(let j = 0; j < length; j++) {
        const toc = userListTocArr[j];
        if(tc < toc) continue;
        userListTocArr.splice(j, 0, tc);
        userListArr.splice(j, 0, list);
        uidList.splice(j, 0, list.user.uid);
        insert = true;
        break;
      }
      if(!insert) {
        userListTocArr.push(tc);
        userListArr.push(list);
        uidList.push(list.user.uid);
      }
    }
    data.userList = userListArr;
    data.uidList = uidList;
    const systemInfo = await db.MessageModel.find({ty: 'STE'}).sort({tc: -1}).limit(1);

    const remind = await db.MessageModel.find({ty: 'STU', r: user.uid}).sort({tc: -1});
    data.remind = await db.MessageModel.extendReminder(remind);

    data.systemInfo = systemInfo;
    data.newRemindCount = user.newMessage.newReminderCount;
    data.newSystemInfoCount = user.newMessage.newSystemInfoCount;

    await next();
  })
  .use('/remind', remindRouter.routes(), remindRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods())
  .use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
  .use('/resource', resourceRouter.routes(), resourceRouter.allowedMethods())
  .use('/systemInfo', systemInfoRouter.routes(), systemInfoRouter.allowedMethods());
module.exports = messageRouter;
