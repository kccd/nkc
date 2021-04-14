const Router = require('koa-router');
const PATH = require('path');
const imageRouter = new Router();
imageRouter
  .get('/', async (ctx, next) => {
    const {data, db, params, settings} = ctx;
    const {uid} = params;
    const {user} = data;
    const friend = await db.FriendModel.findOne({uid: user.uid, tUid: uid});
    if(!friend) ctx.throw(403, '该好友暂未与您建立好友关系');
    if(!friend.info.image) ctx.throw(404, '暂未上传图片');
    const {friendImagePath} = settings.upload;
    ctx.filePath = friendImagePath + '/' + user.uid + '/' + uid + '.jpg';
    ctx.set('Cache-Control', 'public, no-cache');
    await next();
  })
  .post('/', async (ctx, next) => {
    const {params, data, db, body, tools, fs, settings} = ctx;
    const {uid} = params;
    const {user} = data;
    const {friendImagePath} = settings.upload;
    const targetPath = friendImagePath + '/' + user.uid;
    try{
      await fs.access(targetPath);
    }catch(err) {
      await fs.mkdir(targetPath);
    }
    const targetFilePath = targetPath + '/' + uid + '.jpg';
    const friend = await db.FriendModel.findOne({uid: user.uid, tUid: uid});
    if(!friend) ctx.throw(403, '该好友暂未与您建立好友关系');
    const {file} = body.files;
    const {size, name, path} = file;
    let ext = PATH.extname(name);
    if(!ext) ctx.throw(400, '无法识别文件格式');

    ext = ext.toLowerCase();
    ext = ext.replace('.', '');

    if(!['jpg', 'jpeg', 'png'].includes(ext)) ctx.throw(400, '仅支持jpeg, jpg, png格式的图片');

    await tools.imageMagick.friendImageify(path, targetFilePath);
    await fs.unlink(path);

    await friend.updateOne({'info.image': true});
    data.friend = friend;

    await next();
  });
module.exports = imageRouter;
