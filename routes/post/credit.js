const Router = require('koa-router');
const router = new Router();

router
	.post('/xsf', async (ctx, next) => {
		const {db, data, params, body, redis} = ctx;
		const {pid} = params;
		const {user} = data;
		let {num, description} = body;
		num = Number(num);
    if((num + '').indexOf('.') !== -1) ctx.throw(400, '仅支持整数');
		const post = await db.PostModel.findOnly({pid});
		const targetUser = await db.UserModel.findOnly({uid: post.uid});
		if(targetUser.uid === user.uid) ctx.throw(403, '不允许给自己加减学术分');
		const thread = await post.extendThread();
		const forum = await db.ForumModel.findOnly({fid: thread.fid});
		await forum.ensureModeratorsPermission(data);
		if(thread.disabled || thread.disabled) {
			ctx.throw(403,'无法给禁用的帖子或回复评学术分');
		}
		const xsfSettings = await db.SettingModel.findOnly({type: 'xsf'});
		const {addLimit, reduceLimit} = xsfSettings;
		if(num === 0) ctx.throw(400, '分值无效');
		if(num < 0 && -1*num > reduceLimit) ctx.throw(400, `单次扣除不能超过${reduceLimit}学术分`);
		if(num > 0 && num > addLimit) ctx.throw(400, `单次添加不能超过${addLimit}学术分`);
		if(description.length < 2) ctx.throw(400, '理由写的太少了');
    if(description.length > 500) ctx.throw(400, '理由不能超过500个字');
		const _id = await db.SettingModel.operateSystemID('xsfsRecords', 1);
		const newRecord = db.XsfsRecordModel({
      _id,
      uid: targetUser.uid,
      operatorId: user.uid,
      num,
      description,
      ip: ctx.address,
      port: ctx.port,
      pid
    });
    targetUser.xsf += num;
    await newRecord.save();
		try{
      await targetUser.save();
    } catch(err) {
      await newRecord.remove();
      throw(err);
    }
		await targetUser.calculateScore();
		const message = db.MessageModel({
      _id: await db.SettingModel.operateSystemID('messages', 1),
      r: targetUser.uid,
      ty: 'STU',
      port: ctx.port,
      ip: ctx.address,
      c: {
        type: 'xsf',
        pid,
        num,
        description
      }
    });
		await message.save();
		await redis.pubMessage(message);
		await next();
	})
  .del('/xsf/:recordId', async (ctx, next) => {
    const {data, db, query, params} = ctx;
    const {reason} = query;
    const {user} = data;
    const {recordId, pid} = params;
    const record = await db.XsfsRecordModel.findOnly({_id: recordId, pid});
    const post = await db.PostModel.findOnly({pid});
    const targetUser = await db.UserModel.findOnly({uid: post.uid});
    const forum = await db.ForumModel.findOnly({fid: post.fid});
    await forum.ensureModeratorsPermission(data);
    if(reason.length < 2) ctx.throw(400, '撤销原因写的太少啦~');
    const oldXsf = targetUser.xsf;
    targetUser.xsf -= record.num;
    await targetUser.save();
    try{
      await record.update(
        {
          reason,
          tlm: Date.now(),
          lmOperatorId: user.uid,
          canceled: true,
          lmOperatorIp: ctx.address,
          lmOperatorPort: ctx.port
        }
      );
    } catch(err) {
      targetUser.xsf = oldXsf;
      await targetUser.save();
      throw err;
    }
    await next();
  })
	.post('/kcb', async (ctx, next) => {
		const {data, db, body, params} = ctx;
		const {user} = data;
		const {pid} = params;
		let {num, description} = body;
		num = Number(num);
    if((num + '').indexOf('.') !== -1) ctx.throw(400, '仅支持整数');
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
		const kcbSettings = await db.SettingModel.findOnly({type: 'kcb'});
		if(num < kcbSettings.minCount) ctx.throw(400, `科创币最少为${kcbSettings.minCount}`);
		if(num > kcbSettings.maxCount) ctx.throw(400, `科创币不能大于${kcbSettings.maxCount}`);
		if(fromUser.kcb < num) ctx.throw(400, '您的科创币不足');
		if(description.length < 2) ctx.throw(400, '理由写的太少了');
    if(description.length > 60) ctx.throw(400, '理由不能超过60个字');
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