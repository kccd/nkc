const router = require('koa-router')();
const fsPromises = require('fs').promises;
const { OnlyUnbannedUser } = require('../../middlewares/permission');
router
  .get('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { query, db, data } = ctx;
    const { type } = query;
    const { user } = data;
    if (type === 'friendsUid') {
      data.friendsUid = await db.FriendModel.getFriendsUid(user.uid);
    }
    await next();
  })
  // 20230829
  // 取消了短消息添加好友功能，此路由废弃
  .post('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { db, data, body, nkcModules } = ctx;
    const { uid, type } = body;
    const { user } = data;
    if (!['agree', 'disagree', 'ignored'].includes(type)) {
      ctx.throw(400, `type error`);
    }
    const targetUser = await db.UserModel.findOnly({
      uid,
    });
    const application = await db.FriendsApplicationModel.findOnly({
      respondentId: user.uid,
      applicantId: targetUser.uid,
      agree: 'null',
    });
    let { agree } = application;
    if (type === 'agree') {
      await db.FriendModel.createFriend(user.uid, targetUser.uid);
      await nkcModules.socket.sendEventUpdateUserList(user.uid);
      await nkcModules.socket.sendEventUpdateChatList(user.uid);
      await nkcModules.socket.sendEventUpdateUserList(targetUser.uid);
      await nkcModules.socket.sendEventUpdateChatList(targetUser.uid);
      agree = 'true';
    } else if (type === 'disagree') {
      agree = 'false';
      await nkcModules.socket.sendEventUpdateChatList(user.uid);
    } else if (type === 'ignored') {
      agree = 'ignored';
      await nkcModules.socket.sendEventUpdateChatList(user.uid);
    }
    await application.updateOne({
      $set: {
        agree,
        tlm: new Date(),
      },
    });
    await nkcModules.socket.sendNewFriendApplicationToSelf(application._id);
    await next();
  })
  .post('/apply', OnlyUnbannedUser(), async (ctx, next) => {
    const { nkcModules, db, body, data } = ctx;
    const { uid } = body;
    const { user } = data;
    const targetUser = await db.UserModel.findOnly({ uid });
    // 判断对方是否在自己的黑名单中
    await db.BlacklistModel.removeUserFromBlacklist(user.uid, targetUser.uid);
    const friend = await db.FriendModel.findOne({
      uid: user.uid,
      tUid: targetUser.uid,
    });
    if (friend) {
      ctx.throw(400, `对方已在你的联系人列表中，请勿重复添加`);
    }
    await db.FriendModel.createFriend(user.uid, targetUser.uid);
    await nkcModules.socket.sendEventUpdateUserList(user.uid);
    await nkcModules.socket.sendEventUpdateChatList(user.uid);
    await next();
  })
  .put('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { db, body, nkcModules, data, settings, tools } = ctx;
    const { user } = data;
    const { fields, files } = body;
    const friendData = JSON.parse(fields.friend);
    const uid = fields.uid;
    const file = files.file;
    const { cid, name, description, image, phone, location } = friendData;
    const friend = await db.FriendModel.findOne({ uid: user.uid, tUid: uid });
    if (!friend) {
      ctx.throw(400, `该用户不在你的联系人列表中，无权操作`);
    }
    const { checkString } = nkcModules.checkData;
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
    for (const p of phone) {
      if (!p) {
        continue;
      }
      checkString(p, {
        name: '电话',
        minLength: 0,
        maxLength: 20,
      });
      newPhone.push(p);
    }
    const categories = await db.FriendsCategoryModel.find(
      {
        uid: user.uid,
        _id: { $in: cid },
      },
      { _id: 1 },
    );
    const newCid = categories.map((c) => c._id);
    await friend.updateOne({
      $set: {
        'info.name': name,
        'info.description': description,
        'info.phone': newPhone,
        'info.location': location,
        'info.image': !!image,
        cid: newCid,
      },
    });
    await db.FriendsCategoryModel.updateFriendCategories(user.uid, uid, newCid);
    if (file) {
      const { friendImagePath } = settings.upload;
      const targetPath = friendImagePath + '/' + user.uid;
      try {
        await fsPromises.access(targetPath);
      } catch (err) {
        await fsPromises.mkdir(targetPath);
      }
      const targetFilePath = targetPath + '/' + uid + '.jpg';
      const { path } = file;

      await nkcModules.file.getFileExtension(file, ['jpg', 'jpeg', 'png']);

      await tools.imageMagick.friendImageify(path, targetFilePath);
    }
    data.imageUrl = nkcModules.tools.getUrl('messageFriendImage', uid);
    await nkcModules.socket.sendEventUpdateUserList(user.uid);
    await nkcModules.socket.sendEventUpdateChatList(user.uid);
    await next();
  })
  .del('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { nkcModules, db, query, data } = ctx;
    const { uid } = query;
    const { user } = data;
    const targetUser = await db.UserModel.findOnly({ uid });
    await db.FriendModel.removeFriend(user.uid, targetUser.uid);
    await nkcModules.socket.sendEventRemoveFriend(user.uid, targetUser.uid);
    await next();
  });

module.exports = router;
