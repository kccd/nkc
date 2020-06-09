const Router = require("koa-router");
const router = new Router();

router
  .get("/", async (ctx, next) => {
    const {db, query, data, state, nkcModules, redis} = ctx;
    const {user} = data;
    const {type, firstMessageId, uid} = query;
    data.twemoji = state.twemoji;
    const {getUrl} = nkcModules.tools;
    if(type === "UTU") {
      const targetUser = await db.UserModel.findOnly({uid});
      const q = {
        $or: [
          {
            r: user.uid,
            s: uid
          },
          {
            r: uid,
            s: user.uid
          }
        ]
      };
      if(firstMessageId) {
        q._id = {$lt: firstMessageId};
      }

      const messages = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
      messages.map(m => {
        delete m.ip;
        delete m.port;
        if(m.withdrawn) m.c = '';
      });
      data.messages = messages.reverse();
      data.targetUser = targetUser;
      data.tUser = {
        uid: targetUser.uid,
        home: getUrl('userHome', targetUser.uid),
        icon: getUrl('userAvatar', targetUser.avatar),
        name: targetUser.username || targetUser.uid
      }
      await db.UserModel.extendUserInfo(targetUser);
      data.targetUserGrade = await targetUser.extendGrade();
      await db.MessageModel.updateMany({ty: 'UTU', r: user.uid, s: uid, vd: false}, {$set: {vd: true}});
      // 判断是否已创建聊天
      await db.CreatedChatModel.createChat(user.uid, uid);
      data.targetUserSendLimit = (await db.UsersGeneralModel.findOnly({uid: targetUser.uid})).messageSettings.limit;
      // 用户是否能够发送短消息
      data.showMandatoryLimitInfo = false;
      try{
        await db.MessageModel.ensureSystemLimitPermission(user.uid, targetUser.uid);
      } catch(err) {
        data.showMandatoryLimitInfo = true;
      }
      data.blacklistInfo = await db.BlacklistModel.getBlacklistInfo(targetUser.uid, data.user.uid);
    } else if(type === "STE") {
      const q = {
        ty: 'STE'
      };
      if(firstMessageId) {
        q._id = {
          $lt: firstMessageId
        };
      }
      const messages = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
      data.messages = messages.reverse();
      data.tUser = {
        icon: '/statics/message_type/STE.jpg',
        name: '系统通知',
        uid: null,
        home: null
      }
    } else if(type === "STU") {
      const {user} = data;
      const q = {
        ty: 'STU',
        r: user.uid
      };
      if(firstMessageId) {
        q._id = {
          $lt: firstMessageId
        }
      }
      // await db.MessageModel.updateMany({ty: 'STU', r: user.uid, vd: false}, {$set: {vd: true}});
      const remind = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
      const messages = await db.MessageModel.extendSTUMessages(remind);
      data.messages = messages.reverse();
      data.tUser = {
        icon: '/statics/message_type/STU.jpg',
        name: '应用提醒',
        uid: null,
        home: null
      }
    } else if(type === "newFriends") {
      const q = {
        respondentId: user.uid
      };
      if(firstMessageId) {
        q._id = {
          $lt: firstMessageId
        }
      }
      const friendsApplications = await db.FriendsApplicationModel.find(q).sort({toc: -1}).limit(30);
      const applications = [];
      for(const f of friendsApplications) {
        const targetUser = await db.UserModel.findOne({uid: f.applicantId});
        await db.UserModel.extendUserInfo(targetUser);
        if(!targetUser) return;
        applications.push({
          _id: f._id,
          ty: 'newFriends',
          username: targetUser.username || targetUser.uid,
          avatar: targetUser.avatar,
          description: f.description,
          uid: targetUser.uid,
          toc: f.toc,
          agree: f.agree,
          tlm: f.tlm
        });
      }
      data.messages = applications.reverse();
      data.tUser = {
        icon: '/statics/message_type/newFriends.jpg',
        name: '新朋友',
        uid: null,
        home: null
      }
    }
    data.type = type;
    data.mUser = {
      uid: user.uid,
      home: getUrl('userHome', user.uid),
      icon: getUrl('userAvatar', user.avatar),
      name: user.username || user.uid
    }
    data.messages2 = await db.MessageModel.extendMessages(data.user.uid, data.messages);

    await db.MessageModel.markAsRead(type, user.uid, uid);

    ctx.template = 'message/appContentList/appContentList.pug';
    await next();
  });
module.exports = router;
