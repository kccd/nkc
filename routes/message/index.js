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
const dataRouter = require("./data");
const searchRouter = require('./search');
const frameRouter = require('./frame');
const addFriend = require("./addFriend");
const categoryRouter = require('./category');
const listRouter = require('./list');
const friendRouter = require('./friend');
const moment = require("moment");
messageRouter
  .get('/', async (ctx, next) => {
    ctx.template = 'message/message.2.pug';
    await next();
  })
  .get('/old', async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {user} = data;
    data.page = query.page;
    if(ctx.reqType === "app") {
      data.templates = await db.MessageTypeModel.getTemplates("app");
    } else {
      data.templates = await db.MessageTypeModel.getTemplates("web");
    }
    data.userDigestThreadCount = await db.ThreadModel.countDocuments({
      digest: true,
      uid: user.uid
    });
    data.messageSettings = await db.SettingModel.getSettings('message');
    const from = ctx.request.get('FROM');
    if(from !== 'nkcAPI') {
      if(query.uid) {
        data.targetUser = await db.UserModel.findOne({uid: query.uid});
      }
      user.newMessage = {};
      ctx.template = 'message/message.pug';
      data.navbar = {highlight: 'message'};
      data.grades = await db.UsersGradeModel.find({}).sort({_id: 1});
      return await next();
    }
    data.messageTypes = await db.MessageTypeModel.find().sort({toc: 1});
    data.blackListUid = await db.BlacklistModel.getBlacklistUsersId(user.uid);
    const list = [];
    const userList = [];

    // 获取已创建聊天的用户
    const chats = await db.CreatedChatModel.find({uid: user.uid}).sort({tlm: -1});
    const uidArr = new Set(), midArr = new Set(), userObj = {}, messageObj = {}, friendObj = {};
    for(const c of chats) {
      uidArr.add(c.tUid);
      if(c.lmId) midArr.add(c.lmId);
    }
    let users = await db.UserModel.find({
      uid: {
        $in: [...uidArr]
      }
    }, {
      uid: 1,
      username: 1,
      avatar: 1,
      certs: 1,
      xsf: 1,
      postCount: 1,
      threadCount: 1,
      disabledPostsCount: 1,
      disabledThreadsCount: 1,
      online: 1,
      onlineType: 1
    });
    const messages = await db.MessageModel.find({_id: {$in: [...midArr]}}, {ip: 0, port: 0});
    const friendsArr = await db.FriendModel.find({uid: user.uid, tUid: {$in: [...uidArr]}});
    await db.UserModel.extendUsersGrade(users);
    for(const u of users) {
      userObj[u.uid] = u;
    }
    await db.UserModel.extendUsersInfo(users);
    for(const m of messages) {
      messageObj[m._id] = m;
    }
    for(const f of friendsArr) {
      friendObj[f.tUid] = f;
    }
    for(const c of chats) {
      if(c.tUid === user.uid) continue;
      const {unread, tUid, lmId, tlm, toc} = c;
      let message = messageObj[lmId];
      if(!message) {
        message = {
          _id: null,
          ty: "UTU",
          c: "",
          tc: c.toc
        }
      }
      const targetUser = userObj[tUid];
      if(!targetUser) continue;
      const friend = friendObj[tUid];
      let abstract;
      if(message.withdrawn) {
        if(message.r === user.uid) {
          abstract = '对方撤回了一条消息';
        } else {
          abstract = '你撤回了一条消息';
        }
      } else {
        abstract = typeof message.c === 'string'? message.c : message.c.na;
      }
      let name;
      if(friend) {
        name = friend.info.name;
      }
      let status = '离线';
      if(targetUser.online) {
        status = targetUser.onlineType === 'phone'? '手机在线': '网页在线';
      }
      userList.push({
        time: tlm || toc,
        type: 'UTU',
        name: name || targetUser.username || targetUser.uid,
        uid: targetUser.uid,
        icon: nkcModules.tools.getUrl('userAvatar', targetUser.avatar),
        platform: targetUser.online? (targetUser.onlineType === 'phone'? 'app': 'web'): 'outline',
        online: targetUser.online,
        status,
        abstract,
        messageId: message? message._id: null,
        user: targetUser,
        friend,
        message,
        count: unread
      });
    }
    const {chat, beep} = data.user.generalSettings.messageSettings;
    data.sound = {
      UTU: !!beep.usersMessage,
      STE: !!beep.systemInfo,
      STU: !!beep.reminder
    };
    let message;
    // 获取通知
    if(chat.systemInfo) {
      message = await db.MessageModel.findOne({ty: 'STE'}, {ip: 0, port: 0}).sort({tc: -1});
      if(message) {
        list.push({
          time: message?message.tc: new Date('2000-1-1'),
          type: 'STE',
          message,
          uid: null,
          status: null,
          count: user.newMessage.newSystemInfoCount,
          name: '系统通知',
          icon: '/statics/message_type/STE.jpg',
          platform: null,
          messageId: message? message._id: null,
          abstract: message.c,
        });
      }
    }
    // 获取提醒
    if(chat.reminder) {
      message = await db.MessageModel.findOne({ty: 'STU', r: user.uid}, {ip: 0, port: 0}).sort({tc: -1});
      const messageType = await db.MessageTypeModel.findOnly({_id: "STU"});
      list.push({
        time: message?message.tc:new Date("2000-1-1"),
        name: messageType.name,
        timeStr: message?moment(message.tc).format("MM/DD HH:mm"): moment().format("MM/DD HH:mm"),
        type: 'STU',
        message,
        uid: null,
        status: null,
        messageId: message? message._id: null,
        count: user.newMessage.newReminderCount,
        content: message?ctx.state.lang("messageTypes", message.c.type):"",
        icon: '/statics/message_type/STU.jpg',
        platform: null,
        abstract: message?ctx.state.lang("messageTypes", message.c.type): "",
      });
    }

    // 新朋友通知
    if(chat.newFriends) {
      const friendsApplication = await db.FriendsApplicationModel.findOne({respondentId: user.uid}).sort({toc: -1});
      const newFriendsApplicationCount = await db.FriendsApplicationModel.countDocuments({respondentId: user.uid, agree: "null"});
      if(friendsApplication) {
        const targetUser = await db.UserModel.findOne({uid: friendsApplication.applicantId});
        if(targetUser) {
          list.push({
            type: 'newFriends',
            time: friendsApplication.toc,
            count: newFriendsApplicationCount,
            uid: null,
            targetUser,
            status: null,
            messageId: null,
            name: '新朋友',
            icon: '/statics/message_type/newFriends.jpg',
            platform: null,
            abstract: `${targetUser.username}申请添加你为好友`,
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
    // 加载好友
    const friends = await db.FriendModel.find({uid: user.uid});

    data.userList = userList;

    const usersFriends = [];

    let friendList = [];

    const usersIcon = {};

    for(let f of friends) {
      const {tUid} = f;
      const targetUser = await db.UserModel.findOne({uid: tUid});
      if(!targetUser) return;
      f = f.toObject();
      await db.UserModel.extendUserInfo(targetUser);
      f.targetUser = targetUser.toObject();
      usersFriends.push(f);

      const fl = {
        name: f.info.name || targetUser.username || targetUser.uid,
        icon: nkcModules.tools.getUrl('userAvatar', targetUser.avatar),
        platform: targetUser.online? (targetUser.onlineType === 'phone'? 'app': 'web'): 'outline',
        abstract: targetUser.description || '',
        type: 'UTU',
        uid: targetUser.uid,
        fid: f._id,
      };
      friendList.push(fl);
      usersIcon[fl.uid] = fl.icon;
    }
    friendList = nkcModules.pinyin.getGroupsByFirstLetter(friendList, 'name');

    friendList.unshift({
      title: '系统',
      data: [
        {
          name: '系统通知',
          icon: '/statics/message_type/STE.jpg',
          platform: null,
          abstract: `系统通知`,
          type: 'STE',
          uid: null,
          fid: null,
        },
        {
          name: '应用提醒',
          icon: '/statics/message_type/STU.jpg',
          platform: null,
          abstract: `应用提醒`,
          type: 'STU',
          uid: null,
          fid: null,
        },
        {
          name: '新朋友',
          icon: '/statics/message_type/newFriends.jpg',
          platform: null,
          abstract: `申请添加好友`,
          type: 'newFriends',
          uid: null,
          fid: null,
        },
      ]
    });

    data.friendList = friendList;

    data.usersFriends = usersFriends;

    // 分组信息
    data.categories = await db.FriendsCategoryModel.find({uid: user.uid}).sort({toc: -1});

    const categoryList = [];

    for(const c of data.categories) {
      const {name, friendsId, description, id} = c;
      const category = {
        name,
        abstract: description,
        usersId: friendsId,
        cid: id,
        icon: friendsId.map(uid => usersIcon[uid]).slice(0, 9)
      };
      categoryList.push(category);
    }
    data.categoryList = categoryList;
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
  .use('/search', searchRouter.routes(), searchRouter.allowedMethods())
  .use('/systemInfo', systemInfoRouter.routes(), systemInfoRouter.allowedMethods())
  .use("/frame", frameRouter.routes(), frameRouter.allowedMethods())
  .use("/addFriend", addFriend.routes(), addFriend.allowedMethods())
  .use('/category', categoryRouter.routes(), categoryRouter.allowedMethods())
  .use('/list', listRouter.routes(), listRouter.allowedMethods())
  .use('/friend', friendRouter.routes(), friendRouter.allowedMethods())
  .use("/data", dataRouter.routes(), dataRouter.allowedMethods());
module.exports = messageRouter;
