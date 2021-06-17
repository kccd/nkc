const router = require('koa-router')();
const fsPromises = require('fs').promises;
router
  .get('/', async (ctx, next) => {
    const {query, db, data} = ctx;
    const {type} = query;
    const {user} = data;
    if(type === 'friendsUid') {
      data.friendsUid = await db.FriendModel.getFriendsUid(user.uid);
    }
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, data, body, nkcModules} = ctx;
    const {uid, type} = body;
    const {user} = data;
    if(!['agree', 'disagree', 'ignored'].includes(type)) {
      ctx.throw(400, `type error`);
    }
    const targetUser = await db.UserModel.findOnly({
      uid
    });
    const application = await db.FriendsApplicationModel.findOnly({
      respondentId: user.uid,
      applicantId: targetUser.uid,
      agree: 'null'
    });
    let {agree} = application;
    if(type === 'agree') {
      await db.FriendModel.createFriend(user.uid, targetUser.uid);
      await nkcModules.socket.sendEventUpdateUserList(user.uid);
      await nkcModules.socket.sendEventUpdateChatList(user.uid);
      await nkcModules.socket.sendEventUpdateUserList(targetUser.uid);
      await nkcModules.socket.sendEventUpdateChatList(targetUser.uid);
      agree = 'true';
    } else if(type === 'disagree') {
      agree = 'false';
      await nkcModules.socket.sendEventUpdateChatList(user.uid);
    } else if(type === 'ignored') {
      agree = 'ignored';
      await nkcModules.socket.sendEventUpdateChatList(user.uid);
    }
    await application.updateOne({
      $set: {
        agree,
        tlm: new Date(),
      }
    });
    await nkcModules.socket.sendNewFriendApplication(application._id);
    await next();
  })
  .post('/apply', async (ctx, next) => {
    const {db, body, data} = ctx;
    const {uid, description = ''} = body;
    const {user} = data;
    const targetUser = await db.UserModel.findOnly({uid});
    // 判断自己是否在对方黑名单中
    const inBlackList = await db.BlacklistModel.inBlacklist(targetUser.uid, user.uid);
    if(inBlackList) ctx.throw(403, `对方拒绝接收你的消息，你无法添加对方为好友`);
    // 判断对方是否在自己的黑名单中
    await db.BlacklistModel.removeUserFromBlacklist(user.uid, targetUser.uid);
    if(description.length > 200) ctx.throw(400, `验证信息不能超过200个字`);
    const friend = await db.FriendModel.findOne({
      uid: user.uid,
      tUid: targetUser.uid
    });
    if(friend) ctx.throw(400, `对方已在你的好友列表中，请勿重复添加`);
    let applicationLog = await db.FriendsApplicationModel.findOne({
      applicantId: user.uid,
      respondentId: targetUser.uid,
      agree: "null"
    });
    const targetApplicationLog = await db.FriendsApplicationModel.findOne({
      applicantId: targetUser.uid,
      respondentId: user.uid,
      agree: "null"
    });
    if(targetApplicationLog) ctx.throw(400, `对方已向你发起添加好友请求，请在「新朋友」处查看`);
    if(applicationLog) {
      ctx.throw(400, `你已发起添加好友请求，请勿重复提交`);
    } else {
      applicationLog = db.FriendsApplicationModel({
        _id: await db.SettingModel.operateSystemID('friendsApplications', 1),
        applicantId: user.uid,
        respondentId: targetUser.uid,
        description
      });
      await applicationLog.save();
    }
    await db.UsersGeneralModel.updateOne({uid: uid}, {$set: {'messageSettings.chat.newFriends': true}});

    await ctx.nkcModules.socket.sendNewFriendApplication(applicationLog._id);
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, nkcModules, data, settings, tools} = ctx;
    const {user} = data;
    const {fields, files} = body;
    const friendData = JSON.parse(fields.friend);
    const file = files.file;
    const {cid, uid, name, description, image, phone, location} = friendData;
    const friend = await db.FriendModel.findOne({uid: user.uid, tUid: uid});
    if(!friend) ctx.throw(400, `你暂未与对方建立好友关系，请刷新后重试`);
    const {checkString} = nkcModules.checkData;
    checkString(name, {
      name: '备注',
      minLength: 0,
      maxLength: 50,
    });
    checkString(description, {
      name: '简介',
      minLength: 0,
      maxLength: 500,
    });
    checkString(location, {
      name: '地区',
      minLength: 0,
      maxLength: 200,
    });
    const newPhone = [];
    for(const p of phone) {
      if(!p) continue;
      checkString(p, {
        name: '电话',
        minLength: 0,
        maxLength: 20,
      });
      newPhone.push(p);
    }
    const categories = await db.FriendsCategoryModel.find({
      uid: user.uid,
      _id: {$in: cid}
    }, {_id: 1});
    const newCid = categories.map(c => c._id);
    await friend.updateOne({
      $set: {
        'info.name': name,
        'info.description': description,
        'info.phone': newPhone,
        'info.location': location,
        'info.image': !!image,
        cid: newCid
      }
    });
    await db.FriendsCategoryModel.updateFriendCategories(user.uid, uid, newCid);
    if(file) {
      const {friendImagePath} = settings.upload;
      const targetPath = friendImagePath + '/' + user.uid;
      try{
        await fsPromises.access(targetPath);
      }catch(err) {
        await fsPromises.mkdir(targetPath);
      }
      const targetFilePath = targetPath + '/' + uid + '.jpg';
      const {path} = file;

      await nkcModules.file.getFileExtension(file, ['jpg', 'jpeg', 'png']);

      await tools.imageMagick.friendImageify(path, targetFilePath);
    }
    data.imageUrl = nkcModules.tools.getUrl('messageFriendImage', uid);
    await nkcModules.socket.sendEventUpdateUserList(user.uid);
    await nkcModules.socket.sendEventUpdateChatList(user.uid);
    await next();
  })
  .del('/', async (ctx, next) => {
    const {nkcModules, db, query, data} = ctx;
    const {uid} = query;
    const {user} = data;
    const targetUser = await db.UserModel.findOnly({uid});
    await db.FriendModel.removeFriend(targetUser.uid, user.uid);
    await nkcModules.socket.sendEventRemoveFriend(user.uid, uid);
    await next();
  });

module.exports = router;