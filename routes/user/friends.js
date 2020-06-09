const Router = require('koa-router');

const friendsRouter = new Router();

friendsRouter
  .post('/', async (ctx, next) => {
    const {body, data, db, params, redis} = ctx;
    const {uid} = params;
    const {user} = data;
    const {description = ''} = body;

    // 判断自己是否已被对方加入到消息黑名单
    let blackList = await db.MessageBlackListModel.findOne({
      tUid: user.uid,
      uid
    });
    if(blackList) ctx.throw(403, "对方拒绝接收您的消息，您无法添加该用户为好友。");

    // 判断自己是否添加对方到消息黑名单，如果是则将对方从黑名单中移除
    blackList = await db.MessageBlackListModel.findOne({
      tUid: uid,
      uid: user.uid
    });
    if(blackList) await blackList.remove();

    if(description.length > 100) ctx.throw(400, '验证信息不能超过100个字');
    const friend = await db.FriendModel.findOne({uid: user.uid, tUid: uid});
    if(friend) ctx.throw(400, '该用户已经成为您的好友，请勿重复添加');
    let applicationLog = await db.FriendsApplicationModel.findOne({
      applicantId: user.uid,
      respondentId: uid,
      agree: "null"
    });
    let targetApplicationLog = await db.FriendsApplicationModel.findOne({
      applicantId: uid,
      respondentId: user.uid,
      agree: "null"
    });

    await db.UsersGeneralModel.updateOne({uid: uid}, {$set: {'messageSettings.chat.newFriends': true}});

    // 若对方之前已发起添加好友请求，则直接通过验证并简历好友关系。
    if(targetApplicationLog) ctx.throw(400, '该好友已向你发送添加好友申请，请点击信息中的‘新朋友’查看');
    if(applicationLog) {
      applicationLog.toc = Date.now();
      applicationLog.description = description;
      await applicationLog.save();
    } else {
      applicationLog = db.FriendsApplicationModel({
        _id: await db.SettingModel.operateSystemID('friendsApplications', 1),
        applicantId: user.uid,
        respondentId: uid,
        description
      });
      await applicationLog.save();
    }
    await db.BlacklistModel.removeUserFromBlacklist(data.user.uid, uid);
    applicationLog = applicationLog.toObject();
    applicationLog.ty = 'friendsApplication';
    applicationLog.c = 'postApplication';
    redis.pubMessage(applicationLog);
    await next();
  })
  .post('/agree', async (ctx, next) => {
    const {data, db, params, redis, body} = ctx;
    const {uid} = params;
    const {user} = data;

    let application = await db.FriendsApplicationModel.findOnly({respondentId: user.uid, applicantId: uid, agree: "null"});
    const toc = Date.now();

    const {agree} = body;
    if(agree === "true") {
      // 创建好友关系
      let friend = await db.FriendModel.findOne({
        uid: user.uid,
        tUid: uid
      });
      if(!friend) {
        const newFriend1 = db.FriendModel({
          _id: await db.SettingModel.operateSystemID('friends', 1),
          uid: user.uid,
          tUid: uid,
          toc
        });
        await newFriend1.save();
      }
      friend = await db.FriendModel.findOne({
        tUid: user.uid,
        uid: uid
      });
      if(!friend) {
        const newFriend2 = db.FriendModel({
          _id: await db.SettingModel.operateSystemID('friends', 1),
          tUid: user.uid,
          uid: uid,
          toc
        });
        await newFriend2.save();
      }

      // 创建聊天
      const lastMessage = await db.MessageModel.findOne({ty: 'UTU', $or: [{s: user.uid, r: uid}, {s: uid, r: user.uid}]});
      let lmId, tlm;
      if(lastMessage) {
        lmId = lastMessage._id;
        tlm = lastMessage.tc;
      }
      let chat = await db.CreatedChatModel.findOne({
        uid: user.uid,
        tUid: uid
      });
      if(!chat) {
        chat = db.CreatedChatModel({
          _id: await db.SettingModel.operateSystemID('createdChat', 1),
          uid: user.uid,
          tUid: uid,
          toc: toc,
          tlm: tlm||toc,
          lmId
        });
        await chat.save();
      }
      let targetChat = await db.CreatedChatModel.findOne({
        uid: uid,
        tUid: user.uid
      });
      if(!targetChat) {
        targetChat = db.CreatedChatModel({
          _id: await db.SettingModel.operateSystemID('createdChat', 1),
          uid: uid,
          tUid: user.uid,
          toc: toc,
          tlm: tlm||toc,
          lmId
        });
        await targetChat.save();
      }
      application.agree = "true";
    } else if(agree === "false") {
      application.agree = "false";
    } else {
      application.agree = "ignored";
    }
    application.tlm = toc;
    await application.save();
    application = application.toObject();
    application.ty = 'friendsApplication';
    if(agree === "true") {
      application.c = 'agree';
    } else if(agree === "false") {
      application.c = 'disagree';
    } else {
      application.c = 'ignored';
    }
    redis.pubMessage(application);
    const targetUser = await db.UserModel.findOne({uid});
    const _application = {
      _id: application._id,
      ty: 'newFriends',
      username: targetUser.username || targetUser.uid,
      description: application.description,
      uid: targetUser.uid,
      toc: application.toc,
      agree,
    };
    await db.BlacklistModel.removeUserFromBlacklist(user.uid, targetUser.uid);
    data.message = await db.MessageModel.extendMessage(data.user.uid, _application);
    await next();
  })
  .post('/disagree', async (ctx, next) => {
    const {data, db, params, redis} = ctx;
    const {uid} = params;
    const {user} = data;
    const toc = Date.now();
    let application = await db.FriendsApplicationModel.findOnly({respondentId: user.uid, applicantId: uid, agree: "null"});
    application.agree = "false";
    application.tlm = toc;
    await application.save();
    application = application.toObject();
    application.ty = 'friendsApplication';
    application.c = 'disagree';
    redis.pubMessage(application);
    await next();
  });
module.exports = friendsRouter;
