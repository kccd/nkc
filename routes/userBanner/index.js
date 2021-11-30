const Router = require("koa-router");
const router = new Router();
router
  .post("/:uid", async (ctx, next) => {
    const {data, params, body, db} = ctx;
    const {uid} = params;
    const {user} = data;
    if(!user || uid !== user.uid) ctx.throw(403, '权限不足');
    const {file} = body.files;
    if(!file) ctx.throw(400, 'no file uploaded');
    const attachment = await db.AttachmentModel.saveUserBanner(uid, file);
    user.banner = attachment._id;
    await next();
  });
module.exports = router;
