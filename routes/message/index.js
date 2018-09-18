const Router = require('koa-router');
const messageRouter = new Router();
const systemInfoRouter = require('./systemInfo');
const remindRouter = require('./remind');
const userRouter = require('./user');
const resourceRouter = require('./resource');
const markRouter = require('./mark');
const settingsRouter = require('./settings');
const withdrawnRouter = require('./withdrawn');
const newMessageRouter = require('./newMessage');
messageRouter
  .use('/', async (ctx, next) => {
    // 未完善资料的用户跳转到完善资料页
    const {user} = ctx.data;
    if(!user) return ctx.redirect('/login');
    if(user && !user.username) return ctx.redirect('/register');
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    const from = ctx.request.get('FROM');
    if(from !== 'nkcAPI') {
      if(query.uid) {
        data.targetUser = await db.UserModel.findOne({uid: query.uid});
      }
      user.newMessage = {};
      ctx.template = 'message/message.pug';
      return await next();
    }

    const uidList = await db.MessageModel.getUsersFriendsUid(user.uid);

    const list = [];

    // 获取已创建聊天的用户
    for(const uid of uidList) {
      const targetUser = await db.UserModel.findOne({uid});
      if(!targetUser) continue;
      const message = await db.MessageModel.findOne({
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
      if(!message) continue;
      if(message.withdrawn) message.c = '';
      const count = await db.MessageModel.count({
        r: user.uid,
        s: targetUser.uid,
        vd: false
      });
      list.push({
        time: message.tc,
        type: 'UTU',
        user: targetUser,
        message,
        count
      });
    }

    // 获取通知
    let message = await db.MessageModel.findOne({ty: 'STE'}).sort({tc: -1});
    list.push({
      time: message?message.tc: new Date('2000-1-1'),
      type: 'STE',
      message,
      count: user.newMessage.newSystemInfoCount
    });
    // 获取提醒
    message = await db.MessageModel.findOne({ty: 'STU', r: user.uid}).sort({tc: -1});
    list.push({
      time: message?message.tc: new Date('2000-1-1'),
      type: 'STU',
      message,
      count: user.newMessage.newReminderCount
    });

    const userList = [];
    for(const o of list) {
      if(userList.length === 0) {
        userList.push(o);
        continue;
      }
      let inserted = false;
      for(let j = 0; j < userList.length; j++) {
        const m = userList[j];
        if(o.time.getTime() > m.time.getTime()) {
          userList.splice(j, 0, o);
          inserted = true;
          break;
        }
      }
      if(!inserted) {
        userList.push(o);
      }
    }

    data.userList = userList;

    await next();
  })
  .use('/withdrawn', withdrawnRouter.routes(), withdrawnRouter.allowedMethods())
  .use('/mark', markRouter.routes(), markRouter.allowedMethods())
  .use('/remind', remindRouter.routes(), remindRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods())
  .use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
  .use('/resource', resourceRouter.routes(), resourceRouter.allowedMethods())
  .use('/newMessages', newMessageRouter.routes(), newMessageRouter.allowedMethods())
  .use('/systemInfo', systemInfoRouter.routes(), systemInfoRouter.allowedMethods());
module.exports = messageRouter;
