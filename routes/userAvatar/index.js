const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {settings} = ctx;
    ctx.filePath = settings.statics.defaultAvatarPath;
    await next();
  })
  .get("/:hash", async (ctx, next) => {
    const {nkcModules, query, params} = ctx;
    const {hash} = params;
    const {t} = query;
    ctx.filePath = await nkcModules.file.getUserAvatar(hash, t);
    await next();
  })
  .post("/:uid", async (ctx, next) => {
    const {nkcModules, data, params, body} = ctx;
    const {uid} = params;
    const {user} = data;
    if(!user || uid !== user.uid) ctx.throw(403, '权限不足');
    const {file} = body.files;
    if(!file) ctx.throw(400, 'no file uploaded');
    await nkcModules.file.saveUserAvatar(user.uid, file);
    user.avatar = file.hash;
    await next();
  });
module.exports = router;