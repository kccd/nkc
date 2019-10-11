const PATH = require('path');
const Router = require('koa-router');
const resourceRouter = new Router();
resourceRouter
  .get('/:_id', async (ctx, next) => {
    const imageExt = ['jpg', 'jpeg', 'bmp', 'svg', 'png', 'gif'];
    const videoExt = ["mp4", "mov", "3gp", "avi"];
    const {db, params, settings, fs, query, data} = ctx;
    const {_id} = params;
    const {user} = data;
    const {type, channel} = query;
    const messageFile = await db.MessageFileModel.findOnly({_id});
    if(messageFile.targetUid !== user.uid && messageFile.uid !== user.uid && !ctx.permission("getAllMessagesResources")) ctx.throw(403, '权限不足');
    let {path, ext} = messageFile;
    let filePath = PATH.join(settings.upload.messageFilePath, path);
    if(channel && channel === "mp3") {
      filePath = PATH.join(settings.upload.messageVoiceBrowser, path);
      filePath = filePath.replace("amr", "mp3");
    } 
    if(videoExt.includes(ext)) {
      filePath = PATH.join(settings.upload.messageVideoBrowser, path);
      filePath = filePath.replace(ext, "mp4");
      ext = "mp4";
    }

    if(imageExt.includes(ext)) {
      if(type === 'sm') {
        filePath = PATH.join(settings.upload.messageImageSMPath, path);
      }
      try {
        await fs.access(filePath);
      } catch(err) {
        filePath = settings.statics.defaultMessageFilePath;
      }
      ctx.set('Cathe-Control', `public, max-age=${settings.cache.maxAge}`);
    }
    await messageFile.update({$inc: {hits: 1}});
    ctx.filePath = filePath;
    ctx.resource = messageFile;
    ctx.type = ext;
    await next();
  })
  .post('/', async (ctx, next) => {
    const imageExt = ['jpg', 'jpeg', 'bmp', 'svg', 'png'];
    const voiceExt = ['amr'];
    const videoExt = ["mp4", "mov", "3gp", "avi"];
    const {data, db, body, settings, tools, fs} = ctx;
    const { imageMagick, ffmpeg } = ctx.tools;
    try{
      await fs.access(settings.upload.messageFilePath);
    } catch(err) {
      await fs.mkdir(settings.upload.messageFilePath);
      await fs.mkdir(settings.upload.messageImageSMPath);
    }

    const {file} = body.files;
    const {targetUid, socketId, voiceTimer} = body.fields;
    const {user} = data;
    const {messageFilePath, generateFolderName, messageImageSMPath, messageVoiceBrowser, messageVideoBrowser} = settings.upload;
    const targetUser = await db.UserModel.findOnly({uid: targetUid});
    data.targetUser = targetUser;
    // 判断是否有权限发送信息
    await db.MessageModel.ensureSystemLimitPermission(user.uid);
    await db.MessageModel.ensurePermission(user.uid, targetUid, data.userOperationsId.includes('canSendToEveryOne'));

    let files = [];
    if(file && file.constructor === Array) {
      files = file;
    } else {
      files.push(file);
    }
    data.messages = [];
    for(const file of files) {
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
      const mId = await db.SettingModel.operateSystemID('messages', 1);
      let messageTy = "file";
      if(imageExt.includes(ext)) {
        messageTy = "img"
      }else if(voiceExt.includes(ext)) {
        messageTy = "voice"
      }else if(videoExt.includes(ext)) {
        messageTy = "video"
      }
      const message = db.MessageModel({
        _id: mId,
        ty: 'UTU',
        s: user.uid,
        r: targetUser.uid,
        ip: ctx.address,
        port: ctx.port,
        c: {
          ty: messageTy,
          id: _id,
          na: name,
          vl: voiceTimer ? voiceTimer : ''
        }
      });
      await fs.rename(path, targetPath);
      // 将amr语音文件转为mp3
      if(voiceExt.includes(ext)){
        let voiceMp3Path = generateFolderName(messageVoiceBrowser) + _id + '.mp3';
        let targetMp3Path = messageVoiceBrowser + voiceMp3Path;
        await ffmpeg.audioAMRTransMP3(targetPath, targetMp3Path);
      }
      if(imageExt.includes(ext)) {
        // await tools.imageMagick.allInfo(targetPath);
        const timePath = generateFolderName(messageImageSMPath) + _id + '.' + ext;
        const targetSMPath = messageImageSMPath + timePath;
        await tools.imageMagick.messageImageSMify(targetPath, targetSMPath);
      }
      if(videoExt.includes(ext)) {
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
      await message.save();
      data.messages.push(message);
      const message_ = message.toObject();
      message_.socketId = socketId;
      await ctx.redis.pubMessage(message_);
    }
    // 判断是否已创建聊天
    await db.CreatedChatModel.createChat(user.uid, targetUid, true);
    await next();
  });
module.exports = resourceRouter;