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
    const {db, body, params, data, redis, settings, fs, fsPromise, tools} = ctx;
    const {uid} = params;
    const {ffmpeg} = tools;
    const targetUser = await db.UserModel.findOnly({uid});
    if(targetUser.destroyed) ctx.throw(403, "对方账号已注销");
    const {user} = data;
    // 判断是否有权限发送信息
    await db.MessageModel.ensureSystemLimitPermission(user.uid, targetUser.uid);
    await db.MessageModel.ensurePermission(user.uid, uid, data.userOperationsId.includes('canSendToEveryOne'));

    let file, content, socketId, voiceTime;

    if(body.fields) {
      content = body.fields.content;
      socketId = body.fields.socketId;
      voiceTime = body.fields.voiceTime;
      file = body.files.file || null;
    } else {
      content = body.content;
      socketId = body.socketId;
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

      let ext = PATH.extname(name);

      if(!ext) ctx.throw(400, '无法识别文件格式');

      ext = ext.toLowerCase();
      ext = ext.replace('.', '');

      if(['exe'].includes(ext)) ctx.throw(403, '暂不支持上传该类型的文件');

      const _id = await db.SettingModel.operateSystemID('messageFiles', 1);
      const toc = Date.now();
      // 文件存储文件夹
      let messageTy;
      const fileType = await db.MessageFileModel.getFileTypeByExtension(ext);
      let saveFileDir = await db.MessageFileModel.getFileFolder(fileType, toc);
      if(fileType === 'image') {
        messageTy = "img"
      }else if(fileType === 'voice') {
        messageTy = "voice"
        ext = "mp3";
      }else if(fileType === 'video') {
        messageTy = "video"
      } else {
        messageTy = "file";
      }
      // 此文件的目标存储位置
      let targetPath = `${saveFileDir}/${_id}.${ext}`;
      // 消息文件文档对象
      const messageFile = db.MessageFileModel({
        _id,
        oname: name,
        size,
        ext,
        path: targetPath,
        uid: user.uid,
        targetUid: targetUser.uid
      });

      content = {
        ty: messageTy,
        id: _id,
        na: name,
        vl: voiceTime || null
      }

      // 将amr语音文件转为mp3
      if(voiceExt.includes(ext)){
        await ffmpeg.audioAMRTransMP3(path, targetPath);
      } else if(imageExt.includes(ext)) {
        await tools.imageMagick.messageImageSMify(path, targetPath);
      } else if(videoExt.includes(ext)) {
        // 对视频进行转码
        if(['3gp'].indexOf(ext.toLowerCase()) > -1){
          await ffmpeg.video3GPTransMP4(path, targetPath);
        }else if(['mp4'].indexOf(ext.toLowerCase()) > -1) {
          await ffmpeg.videoMP4TransH264(path, targetPath);
        }else if(['mov'].indexOf(ext.toLowerCase()) > -1) {
          await ffmpeg.videoMOVTransMP4(path, targetPath);
        }else if(['avi'].indexOf(ext.toLowerCase()) > -1) {
          await ffmpeg.videoAviTransAvi(path, path);
          await ffmpeg.videoAVITransMP4(path, targetPath);
        }
        // 视频封面图路径
        var videoCoverPath = `${saveFileDir}/${_id}_cover.jpg`;
        await ffmpeg.videoFirstThumbTaker(targetPath, videoCoverPath);
      } else {
        await fsPromise.copyFile(path, targetPath);
      }
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
    delete message.ip;
    delete message.port;
    data.message2 = await db.MessageModel.extendMessage(data.user.uid, message);
    await db.CreatedChatModel.createChat(user.uid, uid, true);
    const message_ = message.toObject();
    message_.socketId = socketId;
    await redis.pubMessage(message_);
    data.message = message;
    data.targetUser = targetUser;
    await next();
  });
module.exports = userRouter;
