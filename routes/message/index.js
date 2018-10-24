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
const chatRouter = require('./chat');
const friendsApplicationRouter = require('./friendsApplication');
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

    const list = [];
    const userList = [];

    // 获取已创建聊天的用户
    const chats = await db.CreatedChatModel.find({uid: user.uid}).sort({tlm: -1});
    for(const c of chats) {
      if(c.tUid === user.uid) continue;
      const {unread, tUid, lmId, tlm} = c;

      const message = await db.MessageModel.findOne({_id: lmId});

      const targetUser = await db.UserModel.findOne({uid: tUid});

      if(!targetUser) continue;

      const friend = await db.FriendModel.findOne({uid: user.uid, tUid});

      userList.push({
        time: tlm,
        type: 'UTU',
        user: targetUser,
        friend,
        message,
        count: unread
      });
    }

    const {chat} = data.user.generalSettings.messageSettings;
    let message;
    // 获取通知
    if(chat.systemInfo) {
      message = await db.MessageModel.findOne({ty: 'STE'}).sort({tc: -1});
      list.push({
        time: message?message.tc: new Date('2000-1-1'),
        type: 'STE',
        message,
        count: user.newMessage.newSystemInfoCount
      });
    }
    // 获取提醒
    if(chat.reminder) {
      message = await db.MessageModel.findOne({ty: 'STU', r: user.uid}).sort({tc: -1});
      list.push({
        time: message?message.tc: new Date('2000-1-1'),
        type: 'STU',
        message,
        count: user.newMessage.newReminderCount
      });
    }

    // 新朋友通知
    if(chat.newFriends) {
      const friendsApplication = await db.FriendsApplicationModel.findOne({respondentId: user.uid}).sort({toc: -1});
      const newFriendsApplicationCount = await db.FriendsApplicationModel.count({respondentId: user.uid, agree: null});
      if(friendsApplication) {
        const targetUser = await db.UserModel.findOne({uid: friendsApplication.applicantId});
        if(targetUser) {
          list.push({
            type: 'newFriends',
            time: friendsApplication.toc,
            count: newFriendsApplicationCount,
            targetUser
          })
        }
      }
    }

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

    // 加载好友
    const friends = await db.FriendModel.find({uid: user.uid});
    const usersFriends = [];
    await Promise.all(friends.map(async f => {
      const {tUid} = f;
      const targetUser = await db.UserModel.findOne({uid: tUid});
      if(!targetUser) return;
      f = f.toObject();
      f.targetUser = targetUser;
      usersFriends.push(f);
    }));
    data.usersFriends = usersFriends;

    // 分组信息
    data.categories = await db.FriendsCategoryModel.find({uid: user.uid}).sort({toc: -1});
    await next();
  })
  .use('/friendsApplication', friendsApplicationRouter.routes(), friendsApplicationRouter.allowedMethods())
  .use('/withdrawn', withdrawnRouter.routes(), withdrawnRouter.allowedMethods())
  .use('/mark', markRouter.routes(), markRouter.allowedMethods())
  .use('/remind', remindRouter.routes(), remindRouter.allowedMethods())
  .use('/user', userRouter.routes(), userRouter.allowedMethods())
  .use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
  .use('/resource', resourceRouter.routes(), resourceRouter.allowedMethods())
  .use('/newMessages', newMessageRouter.routes(), newMessageRouter.allowedMethods())
  .use('/chat', chatRouter.routes(), chatRouter.allowedMethods())
  .use('/systemInfo', systemInfoRouter.routes(), systemInfoRouter.allowedMethods());
module.exports = messageRouter;
