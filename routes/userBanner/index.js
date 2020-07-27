const Router = require("koa-router");
const router = new Router();
router
  .post("/:uid", async (ctx, next) => {
    const {nkcModules, data, params, body} = ctx;
    const {uid} = params;
    const {user} = data;
    if(!user || uid !== user.uid) ctx.throw(403, '权限不足');
    const {file} = body.files;
    if(!file) ctx.throw(400, 'no file uploaded');
    user.banner = await nkcModules.file.saveUserBanner$2(user.uid, file);
    await next();
  });
module.exports = router;
