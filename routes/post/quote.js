const Router = require('koa-router');
const router = new Router();

router
  .get('/', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db, data, nkcModules} = ctx;
    const {xsflimit} = nkcModules;
    let targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    await targetThread.extendForum();
    await targetThread.ensurePermission(data.userRoles, data.userGrade, data.user);
    if(targetPost.disabled) ctx.throw(400, '无法引用已经被禁用的回复');
    await targetPost.extendUser();
    data.targetUser = targetPost.user;
    targetPost = targetPost.toObject();
    data.message = xsflimit(targetPost);
    await next();
  });

module.exports = router;