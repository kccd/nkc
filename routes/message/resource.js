const PATH = require('path');
const FILE = require('../../nkcModules/file');
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
    let filePath = path;
    if(channel && channel === "mp3") {
      filePath = filePath.replace("amr", "mp3");
      filePath = filePath.replace("aac", "mp3");
    }
    if(videoExt.includes(ext)) {
      filePath = filePath.replace(ext, "mp4");
      ext = "mp4";
    }

    if(imageExt.includes(ext)) {
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
    const imageExt = ['jpg', 'jpeg', 'bmp', 'svg', 'png', 'gif'];
    const voiceExt = ['amr'];
    const videoExt = ["mp4", "mov", "3gp", "avi"];
    const {data, db, body, settings, tools, fs, fsPromise} = ctx;
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
    await db.MessageModel.ensureSystemLimitPermission(user.uid, targetUser.uid);
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
      const toc = Date.now();
      // 文件存储文件夹
      let saveFileDir;
      let messageTy;
      if(imageExt.includes(ext)) {
        messageTy = "img"
        saveFileDir = await FILE.getPath("messageImage", toc);
      }else if(voiceExt.includes(ext)) {
        messageTy = "voice"
        saveFileDir = await FILE.getPath("messageVoice", toc);
      }else if(videoExt.includes(ext)) {
        messageTy = "video"
        saveFileDir = await FILE.getPath("messageVideo", toc);
      } else {
        messageTy = "file";
        saveFileDir = await FILE.getPath("messageFiles", toc);
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
      const mId = await db.SettingModel.operateSystemID('messages', 1);
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
        var videoCoverPath = `${saveFileDir}/${_id}-frame.jpg`;
        await ffmpeg.videoFirstThumbTaker(targetPath, videoCoverPath);
      } else {
        await fsPromise.copyFile(path, targetPath);
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
