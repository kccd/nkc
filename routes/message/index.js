const Router = require('koa-router');
const messageRouter = new Router();
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
    ctx.template = 'message/message.pug';
    await next();
  });
module.exports = messageRouter;
