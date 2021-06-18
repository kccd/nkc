const Router = require('koa-router');
const userRouter = new Router();
const PATH = require("path");

userRouter
  .get('/', async (ctx, next) => {
    const {db, data, query, nkcModules} = ctx;
    const {uid} = query;
    const {user} = data;
    let targetUser = await db.UserModel.findOnly({
      uid
    });
    targetUser = await db.UserModel.extendUserInfo(targetUser);
    data.tUser = {
      homeUrl: nkcModules.tools.getUrl('userHome', targetUser.uid),
      uid: targetUser.uid,
      name: targetUser.username,
      avatar: nkcModules.tools.getUrl('userAvatar', targetUser.avatar),
      description: targetUser.description,
      certsName: targetUser.info.certsName,
      gradeIcon: nkcModules.tools.getUrl('gradeIcon', targetUser.grade._id),
      inBlacklist: await db.BlacklistModel.inBlacklist(user.uid, targetUser.uid)
    }
    data.friend = await db.FriendModel.findOne({
      uid: user.uid,
      tUid: uid
    });
    if(data.friend) {
      await data.friend.extendCid();
    }
    if(data.friend && data.friend.info.image) {
      data.friend = data.friend.toObject();
      data.friend.info.imageUrl = nkcModules.tools.getUrl('messageFriendImage', targetUser.uid) + "?t=" + Date.now();
    }
    data.categories = await db.FriendsCategoryModel.find({
      uid: user.uid,
    }, {
      _id: 1,
      name: 1,
    }).sort({toc: -1});
    await next();
  })
  .get('/:uid', async (ctx, next) => {
    const {data, db, query, params} = ctx;
    const {uid} = params;
    const {user} = data;
    const {firstMessageId} = query;
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

    const messages = await db.MessageModel.find(q, {ip: 0, port: 0}).sort({tc: -1}).limit(30);
    messages.map(m => {
      if(m.withdrawn) m.c = '';
    });
    data.messages = messages.reverse();
    data.targetUser = targetUser;
    await db.MessageModel.updateMany({ty: 'UTU', r: user.uid, s: uid, vd: false}, {$set: {vd: true}});
    // 判断是否已创建聊天
    await db.CreatedChatModel.createChat(user.uid, uid);

    await next();
  })
  .post('/:uid', async (ctx, next) => {
    const {db, body, params, data, nkcModules, fsPromise, tools} = ctx;
    const {uid} = params;
    const {ffmpeg} = tools;
    const targetUser = await db.UserModel.findOnly({uid});
    if(targetUser.destroyed) ctx.throw(403, "对方账号已注销");
    const {user} = data;
    // 判断是否有权限发送信息
    await db.MessageModel.ensureSystemLimitPermission(user.uid, targetUser.uid);
    await db.MessageModel.ensurePermission(user.uid, uid, data.userOperationsId.includes('canSendToEveryOne'));

    let file, content, voiceTime, localId, isVoice;

    if(body.fields) {
      content = body.fields.content;
      localId = body.fields.localId;
      isVoice = body.fields.isVoice;
      file = body.files.file || null;
    } else {
      content = body.content;
    }

    // 仅普通信息
    if(!file) {
      if(content === '') ctx.throw(400, '内容不能为空');
    } else {
      const imageExt = ['jpg', 'jpeg', 'bmp', 'svg', 'png', 'gif'];
      const voiceExt = ['amr', 'aac'];
      const videoExt = ["mp4", "mov", "3gp", "avi"];
      const {name, size, path} = file;

      // 附件尺寸限制
      await db.MessageModel.checkFileSize(file);

      const ext = await nkcModules.file.getFileExtension(file);

      if(['exe', 'bat'].includes(ext)) ctx.throw(403, '暂不支持上传该类型的文件');

      const fileType = await db.MessageFileModel.getFileTypeByExtension(ext, isVoice);

      const _id = await db.SettingModel.operateSystemID('messageFiles', 1);

      const toc = Date.now();

      // 文件存储文件夹
      const saveFileDir = await db.MessageFileModel.getFileFolder(fileType, toc);

      let extension = ext;
      let targetFilePath;

      if(fileType === 'voice') {
        const extension = 'mp3';
        targetFilePath = `${saveFileDir}/${_id}.${extension}`;
        await ffmpeg.audioTransMP3(path, targetFilePath, ext);
      } else if(fileType === 'video') {
        const extension = 'mp4';
        targetFilePath = `${saveFileDir}/${_id}.${extension}`;
        await ffmpeg.videoTransMP4(path, targetFilePath, ext);
        // 视频封面图路径
        await ffmpeg.videoFirstThumbTaker(targetFilePath, `${saveFileDir}/${_id}_cover.jpg`);
      } else if(fileType === 'audio') {
        const extension = 'mp3';
        targetFilePath = `${saveFileDir}/${_id}.${extension}`;
        await ffmpeg.audioTransMP3(path, targetFilePath, ext);
      } else if(fileType === 'image') {
        targetFilePath = `${saveFileDir}/${_id}.${extension}`;
        await tools.imageMagick.messageImageSMify(path, targetFilePath);
      } else {
        targetFilePath = `${saveFileDir}/${_id}.${extension}`;
        await fsPromise.copyFile(path, targetFilePath);
      }

      const newFile = await nkcModules.file.getFileObjectByFilePath(targetFilePath);

      let duration = 0;

      if(['video'].includes(fileType)) {
        const fileInfo = await ffmpeg.getVideoInfo(targetFilePath);
        duration = Math.round(fileInfo.duration * 1000);
      } else if(['voice', 'audio'].includes(fileType)) {
        const fileInfo = await ffmpeg.getAudioDuration(targetFilePath);
        duration = Math.round(fileInfo.duration * 1000);
      }

      // 消息文件文档对象
      const messageFile = db.MessageFileModel({
        _id,
        type: fileType,
        oname: name,
        size: newFile.size,
        ext: newFile.ext,
        uid: user.uid,
        targetUid: targetUser.uid,
        duration
      });

      content = {
        fileId: _id
      };

      await messageFile.save();
    }

    const _id = await db.SettingModel.operateSystemID('messages', 1);
    const message = db.MessageModel({
      _id,
      ty: 'UTU',
      c: content,
      s: user.uid,
      r: uid,
      ip: ctx.address,
      port: ctx.port
    });
    await message.save();
    // 判断是否已创建聊天
    await db.CreatedChatModel.createChat(user.uid, uid, true);
    await nkcModules.socket.sendMessageToUser(message._id, localId);
    await next();
  });
module.exports = userRouter;
