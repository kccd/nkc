const PATH = require('path');
const FILE = require('../../nkcModules/file');
const Router = require('koa-router');
const resourceRouter = new Router();
resourceRouter
  .get('/:_id', async (ctx, next) => {
    const {db, params, settings, fs, query, data} = ctx;
    const {_id} = params;
    const {user} = data;
    const {type, channel} = query;
    const messageFile = await db.MessageFileModel.findOnly({_id});
    if(messageFile.targetUid !== user.uid && messageFile.uid !== user.uid && !ctx.permission("getAllMessagesResources")) ctx.throw(403, '权限不足');
    let {ext} = messageFile;
    let filePath = await messageFile.getFilePath(type);
    const fileType = await db.MessageFileModel.getFileTypeByExtension(ext);
    if(fileType === 'image') {
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
    const { ffmpeg } = ctx.tools;
    try{
      await fs.access(settings.upload.messageFilePath);
    } catch(err) {
      await fs.mkdir(settings.upload.messageFilePath);
      await fs.mkdir(settings.upload.messageImageSMPath);
    }

    const {file} = body.files;
    const {targetUid, socketId, voiceTimer} = body.fields;
    const {user} = data;
    const targetUser = await db.UserModel.findOnly({uid: targetUid});
    data.targetUser = targetUser;
    // 判断是否有权限发送信息
    await db.MessageModel.ensureSystemLimitPermission(user.uid, targetUser.uid);
    await db.MessageModel.ensurePermission(user.uid, targetUid, data.userOperationsId.includes('canSendToEveryOne'));

    const {name, size, path} = file;

    // 附件尺寸限制
    await db.MessageModel.checkFileSize(file);

    // 确定文件格式
    let ext = PATH.extname(name);
    if(!ext) ctx.throw(400, '无法识别文件格式');
    ext = ext.toLowerCase();
    ext = ext.replace('.', '');

    // 权限
    if(['exe'].includes(ext)) ctx.throw(403, '暂不支持上传该类型的文件');

    // 消息文件id
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
      var videoCoverPath = `${saveFileDir}/${_id}_cover.jpg`;
      await ffmpeg.videoFirstThumbTaker(targetPath, videoCoverPath);
    } else {
      await fsPromise.copyFile(path, targetPath);
    }
    await messageFile.save();
    await message.save();
    data.messages = [message];
    const message_ = message.toObject();
    message_.socketId = socketId;
    await ctx.redis.pubMessage(message_);
    // 判断是否已创建聊天
    await db.CreatedChatModel.createChat(user.uid, targetUid, true);
    await next();
  });
module.exports = resourceRouter;
