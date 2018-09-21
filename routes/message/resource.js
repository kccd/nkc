const PATH = require('path');
const Router = require('koa-router');
const resourceRouter = new Router();
resourceRouter
  .get('/:_id', async (ctx, next) => {
    const imageExt = ['jpg', 'jpeg', 'bmp', 'svg', 'png', 'gif'];
    const {db, params, settings, fs, query, data} = ctx;
    const {_id} = params;
    const {user} = data;
    const {type} = query;
    const messageFile = await db.MessageFileModel.findOnly({_id});
    if(messageFile.targetUid !== user.uid && messageFile.uid !== user.uid) ctx.throw(403, '权限不足');
    const {path, ext} = messageFile;
    let filePath = PATH.join(settings.upload.messageFilePath, path);
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
    const {data, db, body, settings, tools, fs} = ctx;
    try{
      await fs.access(settings.upload.messageFilePath);
    } catch(err) {
      await fs.mkdir(settings.upload.messageFilePath);
      await fs.mkdir(settings.upload.messageImageSMPath);
    }
    const {file} = body.files;
    const {targetUid, socketId} = body.fields;
    const {user} = data;
    const {messageFilePath, generateFolderName, messageImageSMPath} = settings.upload;
    const targetUser = await db.UserModel.findOnly({uid: targetUid});
    data.targetUser = targetUser;
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
      const message = db.MessageModel({
        _id: mId,
        ty: 'UTU',
        s: user.uid,
        r: targetUser.uid,
        c: {
          ty: imageExt.includes(ext)? 'img': 'file',
          id: _id,
          na: name
        }
      });
      await fs.rename(path, targetPath);
      if(imageExt.includes(ext)) {
        // await tools.imageMagick.allInfo(targetPath);
        const timePath = generateFolderName(messageImageSMPath) + _id + '.' + ext;
        const targetSMPath = messageImageSMPath + timePath;
        await tools.imageMagick.messageImageSMify(targetPath, targetSMPath);
      }
      await messageFile.save();
      await message.save();
      data.messages.push(message);
      const message_ = message.toObject();
      message_.socketId = socketId;
      await ctx.redis.pubMessage(message_);
    }

    await next();
  });
module.exports = resourceRouter;