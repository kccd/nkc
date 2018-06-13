const Router = require('koa-router');
const router = new Router();

router
	.post('/xsf', async (ctx, next) => {
		const {db, data, params, body} = ctx;
		const {pid} = params;
		const {user} = data;
		const {q, reason} = body;
		const targetPost = await db.PostModel.findOnly({pid});
		const targetThread = await targetPost.extendThread();
		await targetThread.extendForum();
		if(targetThread.disabled || targetPost.disabled) {
			ctx.throw(403,'无法给禁用的帖子或回复评学术分');
		}
		if(q < -10000 || q > 10000) ctx.throw(400, '数字无效，不在范围（-10000, 10000）');
		if(reason.length < 2) ctx.throw(400, '理由写的太少了');
		const targetUser = await targetPost.extendUser();
		const log = db.UsersScoreLogModel({
			uid: user.uid,
			type: 'xsf',
			targetUid: targetUser.uid,
			change: 0,
			targetChange: q,
			operationId: data.operationId,
			description: reason,
			fid: targetThread.fid,
			pid,
			tid: targetThread.tid
		});
		await log.save();
		await targetUser.update({$inc: {xsf: q}});
		targetUser.xsf += q;
		await targetUser.calculateScore();

		const updateObjForPost = {
			username: user.username,
			uid: user.uid,
			pid: targetPost.pid,
			toc: Date.now(),
			source: 'nkc',
			reason,
			type: 'xsf',
			q
		};
		await targetPost.update({$push: {credits: updateObjForPost}});

		await next();
	})
	.post('/kcb', async (ctx, next) => {
		const {data, db, body, params} = ctx;
		const {user} = data;
		const {pid} = params;
		const {q, reason} = body;
		const targetPost = await db.PostModel.findOnly({pid});
		const targetUser = targetPost.extendUser();
		const targetThread = await targetPost.extendThread();
		await targetThread.extendForum();

		if(targetThread.disabled || targetPost.disabled) {
			ctx.throw(403,'无法给禁用的帖子或回复评科创币');
		}
		if(q <= 0) ctx.throw(400, '科创币不能小于0');
		if(q > 10000) ctx.throw(400, '单次评科创币不能大于10000');

		if(user.kcb < q) ctx.throw(400, '您的科创币不足');

		if(reason.length < 2) ctx.throw(400, '理由写的太少了');

		const log = db.UsersScoreLogModel({
			uid: user.uid,
			targetUid: targetUser.uid,
			change: -1*q,
			targetChange: q,
			type: 'kcb',
			operationId: data.operationId,
			description: reason,
			fid: targetThread.fid,
			tid: targetThread.tid,
			pid
		});
		await log.save();
		await targetUser.update({$inc: {kcb: q}});
		targetUser.kcb += q;
		await user.update({$inc: {kcb: -1*q}});
		user.kcb -= q;
		await targetUser.calculateScore();
		await user.calculateScore();

		const updateObjForPost = {
			username: user.username,
			uid: user.uid,
			pid: targetPost.pid,
			toc: Date.now(),
			source: 'nkc',
			reason,
			type: 'kcb',
			q
		};
		await targetPost.update({$push: {credits: updateObjForPost}});

		await next();
	})
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
	  if(type === 'kcb') {
		  if(user.kcb < q) ctx.throw(400, '您的科创币余额不足');
	  }
    if(reason.length < 2) ctx.throw(400, '理由写得太少了，请认真对待');
    if(type !== 'xsf' && type !== 'kcb') ctx.throw(400, '未知的类型，请检查');
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