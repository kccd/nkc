const Router = require('koa-router');
const messageRouter = new Router();
const systemInfoRouter = require('./systemInfo');
const remindRouter = require('./remind');
const userRouter = require('./user');
messageRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    let rList = await db.MessageModel.aggregate([
      {
        $match: {
          s: user.uid
        }
      },
      {
        $sort: {
          tc: -1
        }
      },
      {
        $group: {
          _id: '$r',
        }
      }
    ]);
    let sList = await db.MessageModel.aggregate([
      {
        $match: {
          r: user.uid
        }
      },
      {
        $sort: {
          tc: -1
        }
      },
      {
        $group: {
          _id: '$s',
        }
      }
    ]);
    const list = rList.concat(sList);
    let uidList = [];
    for(const o of list) {
      if(o._id !== user.uid && !uidList.includes(o._id)) {
        uidList.push(o._id);
      }
    }

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
    const allSystemInfoCount = await db.MessageModel.count({ty: 'STE'});
    const viewedSystemInfoCount = await db.SystemInfoLogModel.count({uid: user.uid});
    const newSystemInfoCount = allSystemInfoCount - viewedSystemInfoCount;

    const remind = await db.MessageModel.find({ty: 'STU', r: user.uid}).sort({tc: -1});
    const newRemindCount = await db.MessageModel.count({ty: 'STU', r: user.uid, vd: false});

    data.remind = await db.MessageModel.extendReminder(remind);
    data.newRemindCount = newRemindCount;

    data.systemInfo = systemInfo;
    data.newSystemInfoCount = newSystemInfoCount;
    ctx.template = 'message/message.pug';
    await next();
  })
  .use('/remind', remindRouter.routes(), remindRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods())
  .use('/systemInfo', systemInfoRouter.routes(), systemInfoRouter.allowedMethods());
module.exports = messageRouter;
