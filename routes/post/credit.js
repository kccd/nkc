const Router = require('koa-router');
const router = new Router();

router
	.post('/xsf', async (ctx, next) => {
		const {db, data, params, body} = ctx;
		const {pid} = params;
		const {user} = data;
		const {num, description} = body;
		const post = await db.PostModel.findOnly({pid});
		const thread = await post.extendThread();
		const forum = await db.ForumModel.findOnly({fid: thread.fid});
		const isModerator = await forum.isModerator(data.user);
		if(thread.disabled || thread.disabled) {
			ctx.throw(403,'无法给禁用的帖子或回复评学术分');
		}
		const xsfSettings = await db.SettingModel.findOnly({type: 'xsf'});
		const {addLimit, reduceLimit} = xsfSettings;
		if(num === 0) ctx.throw(400, '分值无效');
		if(num < 0 && -1*num > reduceLimit) ctx.throw(400, `单次扣除不能超过${reduceLimit}学术分`);
		if(num > 0 && num > addLimit) ctx.throw(400, `单次添加不能超过${addLimit}学术分`);
		if(description.length < 2) ctx.throw(400, '理由写的太少了');

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
		const {num, description} = body;
		const fromUser = user;
		const post = await db.PostModel.findOnly({pid});
    const toUser = await db.UserModel.findOnly({uid: post.uid});
    if(fromUser.uid === toUser.uid) ctx.throw(400, '自己给自己鼓励不需要科创币');
    const thread = await db.ThreadModel.findOnly({tid: post.tid});
		if(thread.disabled) {
			ctx.throw(403,'文章已被封禁');
		}
		if(post.disabled) {
		  ctx.throw(403, '回复已被封禁');
    }
		if(num <= 0) ctx.throw(400, '科创币最少为1');
		if(num > 10000) ctx.throw(400, '单次鼓励科创币不能大于10000');
		if(fromUser.kcb < num) ctx.throw(400, '您的科创币不足');
		if(description.length < 2) ctx.throw(400, '理由写的太少了');
    await db.KcbsRecordModel.insertUsersRecord({
      fromUser,
      toUser,
      post,
      description,
      num,
      ip: ctx.address,
      port: ctx.port
    });
		await fromUser.calculateScore();
		await toUser.calculateScore();

		const updateObjForPost = {
			username: user.username,
			uid: user.uid,
			pid: post.pid,
			toc: Date.now(),
			source: 'nkc',
			reason: description,
			type: 'kcb',
			q: num
		};
		await post.update({$push: {credits: updateObjForPost}});

		await next();
	});

module.exports = router;