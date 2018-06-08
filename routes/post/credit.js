const Router = require('koa-router');
const router = new Router();

router
  .patch('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {pid} = ctx.params;
    const {user} = data;
    const {type, q, reason} = ctx.body;
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await targetPost.extendThread();
    const targetForum = await targetThread.extendForum();
    const disabled = targetThread.disabled || targetPost.disabled;
    if(disabled) ctx.throw(403,'无法给禁用的帖子或回复评学术分');
    // 权限判断
    const isModerator = await targetForum.isModerator(data.user?data.user.uid: '');
    if(!isModerator && !data.userOperationsId.includes('creditPost')) {
	    ctx.throw(403,'权限不足');
    }
    if(q < -10000 || q > 10000) ctx.throw(400, '数字无效，不在范围（-10000, 10000）');
    if(reason.length < 2) ctx.throw(400, '理由写得太少了，请认真对待');
    if(type !== 'xsf' && type !== 'kcb') ctx.throw(400, '未知的数字类型，请检查');
    const targetUser = await targetPost.extendUser();
    const obj = {
    	type,
	    uid: user.uid,
	    change: 0,
	    targetChange: q,
	    targetUid: targetPost.uid,
	    description: reason,
	    operationId: data.operationId,
	    pid,
	    tid: targetThread.tid,
	    fid: targetForum.fid
    };
    const newScoreLog = db.UsersScoreLogModel(obj);
    await newScoreLog.save();
    const updateObjForUser = {};
    updateObjForUser[type] = q;
    const updateObjForPost = {
      username: user.username,
      uid: user.uid,
      pid: targetPost.pid,
      toc: Date.now(),
      source: 'nkc',
      reason,
      type,
      q
    };
    await targetUser.update({$inc: updateObjForUser});
    await targetPost.update({$push: {credits: updateObjForPost}});
    data.targetUser = targetUser;
    await next();
  });

module.exports = router;