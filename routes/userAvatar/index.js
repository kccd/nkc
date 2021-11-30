const Router = require("koa-router");
const router = new Router();
router
  .get("/:id", async (ctx) => {
    const {id} = ctx.params;
    return ctx.redirect(ctx.nkcModules.tools.getUrl('userAvatar', id));
  })
  .post("/:uid", async (ctx, next) => {
    const {db, data, params, body} = ctx;
    const {uid} = params;
    const {user} = data;
    if(!user || uid !== user.uid) ctx.throw(403, '权限不足');
    const {file} = body.files;
    if(!file) ctx.throw(400, 'no file uploaded');
    const attachment = await db.AttachmentModel.saveUserAvatar(uid, file);
    user.avatar = attachment._id;
    await next();
  });
module.exports = router;
