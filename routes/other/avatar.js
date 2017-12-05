const Router = require('koa-router');
const router = new Router();
const fs = require('fs');
const {accessSync} = fs;
const path = require('path');
const mime = require('mime');
const {promisify} = require('util');

router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a uid is required.');
    await next()
  })
  .get('/:uid', async (ctx, next) => {
    const {uid} = ctx.params;
    try {
      const url = path.resolve(__dirname, `../../resources/avatars/${uid}.jpg`);
      accessSync(url);
      ctx.filePath = url;
    } catch(e) {}
    try {
      const url = path.resolve(__dirname, `../../resources/avatars/${uid}.jpeg`);
      accessSync(url);
      ctx.filePath = url;
    } catch(e) {}
    try {
      const url = path.resolve(__dirname, `../../resources/avatars/${uid}.png`);
      accessSync(url);
      ctx.filePath = url;
    } catch(e) {}
    if(!ctx.filePath) {
      ctx.filePath = path.resolve(__dirname, '../../resources/default_things/default_avatar_small.gif')
    }
    await next()
  })
  .post('/:uid', async (ctx, next) => {
    const {uid} = ctx.params;
    const {settings, data, db} = ctx;
    const {user} = data;
    if(uid !== user.uid) ctx.throw(401, '权限不足');
    const extArr = ['jpg', 'png', 'jpeg'];
    const {imageMagick} = ctx.tools;
    const file = ctx.body.files.file;
    if(!file) ctx.throw(400, 'no file uploaded');
    const {path, type} = file;
    const extension = mime.getExtension(type);
    if(!extArr.includes(extension)) {
      ctx.throw(400, 'wrong mimetype for avatar...jpg, jpeg or png only.')
    }
    await imageMagick.avatarify(path);
    const saveName = uid + '.' + extension;
    const {avatarPath} = settings.upload;
    const targetFile = avatarPath + '/' + saveName;
    for(let e of extArr) {
      const path = `${avatarPath}/${uid}.${e}`;
      try{
        fs.unlinkSync(path);
      } catch(e){}
    }
    await promisify(fs.rename)(path, targetFile);
    await next();
  });

module.exports = router;