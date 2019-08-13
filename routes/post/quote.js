const Router = require('koa-router');
const router = new Router();

router
  .get('/', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db, data, nkcModules} = ctx;
    const {xsflimit} = nkcModules;
    let targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    await targetThread.extendForums(['mainForums', 'minorForums']);
    await targetThread.ensurePermission(data.userRoles, data.userGrade, data.user);
    if(targetPost.disabled) ctx.throw(403, '无法引用已经被禁用的回复');
    if(!targetPost.reviewed) ctx.throw(403, "回复未通过审核，暂无法引用");
    if(!targetPost.anonymous) {
      await targetPost.extendUser();
      data.targetUser = targetPost.user;
    } else {
      targetPost.uid = "";
    }
    targetPost = targetPost.toObject();
    data.message = xsflimit(targetPost);
    data.postUrl = await db.PostModel.getUrl(targetPost);
    await next();
  });

module.exports = router;