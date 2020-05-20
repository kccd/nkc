const Router = require('koa-router');
const userRouter = new Router();
const PATH = require("path");
userRouter
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

    const messages = await db.MessageModel.find(q).sort({tc: -1}).limit(30);
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
    const {db, body, params, data, redis, settings, fs, tools} = ctx;
    const {uid} = params;
    const {ffmpeg} = tools;
    const targetUser = await db.UserModel.findOnly({uid});
    if(targetUser.destroyed) ctx.throw(403, "对方账号已注销");
    const {user} = data;
    // 判断是否有权限发送信息
    await db.MessageModel.ensureSystemLimitPermission(user.uid, targetUser.uid);
    await db.MessageModel.ensurePermission(user.uid, uid, data.userOperationsId.includes('canSendToEveryOne'));

    let file, content, socketId, voiceTimer;

    if(body.fields) {
      content = body.fields.content;
      socketId = body.fields.socketId;
      voiceTimer = body.fields.voiceTimer;
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
      const voiceExt = ['amr'];
      const videoExt = ["mp4", "mov", "3gp", "avi"];
      const {messageFilePath, generateFolderName, messageImageSMPath, messageVoiceBrowser, messageVideoBrowser} = settings.upload;
      const {name, size, path} = file;
      let ext = PATH.extname(name);

      if(!ext) ctx.throw(400, '无法识别文件格式');


      ext = ext.toLowerCase();
      ext = ext.replace('.', '');

      if(['exe'].includes(ext)) ctx.throw(403, '暂不支持上传该类型的文件');

      const _id = await db.SettingModel.operateSystemID('messageFiles', 1);
      const timePath = generateFolderName(messageFilePath) + _id + '.' + ext;
      const targetPath = messageFilePath + timePath;
      const messageFile = db.MessageFileModel({
        _id,
        oname: name,
        size,
        ext,
        path: timePath,
        uid: user.uid,
        targetUid: targetUser.uid
      });
      let messageTy = "file";
      if(imageExt.includes(ext)) {
        messageTy = "img"
      }else if(voiceExt.includes(ext)) {
        messageTy = "voice"
      }else if(videoExt.includes(ext)) {
        messageTy = "video"
      }

      content = {
        ty: messageTy,
        id: _id,
        na: name,
        vl: voiceTimer || null
      }

      await fs.rename(path, targetPath);

      // 将amr语音文件转为mp3
      if(voiceExt.includes(ext)){
        let voiceMp3Path = generateFolderName(messageVoiceBrowser) + _id + '.mp3';
        let targetMp3Path = messageVoiceBrowser + voiceMp3Path;
        await ffmpeg.audioAMRTransMP3(targetPath, targetMp3Path);
      } else if(imageExt.includes(ext)) {
        // await tools.imageMagick.allInfo(targetPath);
        const timePath = generateFolderName(messageImageSMPath) + _id + '.' + ext;
        const targetSMPath = messageImageSMPath + timePath;
        await tools.imageMagick.messageImageSMify(targetPath, targetSMPath);
      } else if(videoExt.includes(ext)) {
        // 对视频进行转码
        let videoPath = generateFolderName(messageVideoBrowser) + _id + '.mp4';
        const targetVideoPath = messageVideoBrowser + videoPath;
        if(['3gp'].indexOf(ext.toLowerCase()) > -1){
          await ffmpeg.video3GPTransMP4(targetPath, targetVideoPath);
        }else if(['mp4'].indexOf(ext.toLowerCase()) > -1) {
          await ffmpeg.videoMP4TransH264(targetPath, targetVideoPath);
        }else if(['mov'].indexOf(ext.toLowerCase()) > -1) {
          await ffmpeg.videoMOVTransMP4(targetPath, targetVideoPath);
        }else if(['avi'].indexOf(ext.toLowerCase()) > -1) {
          await ffmpeg.videoAviTransAvi(targetPath, targetPath);
          await ffmpeg.videoAVITransMP4(targetPath, targetVideoPath);
        }
        // 视频封面图路径
        var videoImgPath = messageFilePath + generateFolderName(messageVideoBrowser) + _id + "-frame.jpg";
        await ffmpeg.videoFirstThumbTaker(targetVideoPath, videoImgPath);
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
