const Router = require('koa-router');
const router = new Router();

router
	.post('/xsf', async (ctx, next) => {
		const {db, data, params, body, redis} = ctx;
		const {pid} = params;
		const {user} = data;
		let {num, description} = body;
		num = Number(num);
    if(num%1 !== 0) ctx.throw(400, "学术分仅支持整数加减");
		const post = await db.PostModel.findOnly({pid});
		const targetUser = await db.UserModel.findOnly({uid: post.uid});
		if(targetUser.uid === user.uid) ctx.throw(403, '不允许给自己加减学术分');
		const thread = await post.extendThread();
    const forums = await thread.extendForums(['mainForums', 'minorForums']);
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of forums) {
        isModerator = await f.isModerator(user);
        if(isModerator) break;
      }
    }
    if(!isModerator) ctx.throw(400, '权限不足');
    data.isModerator = isModerator;
		if(thread.disabled || thread.disabled) {
			ctx.throw(403,'无法给禁用的文章或回复评学术分');
		}
		const xsfSettings = await db.SettingModel.findOnly({_id: 'xsf'});
		const {addLimit, reduceLimit} = xsfSettings.c;
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
      await newRecord.deleteOne();
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
		await ctx.nkcModules.socket.sendMessageToUser(message._id);
		await next();
	})
  .del('/xsf/:recordId', async (ctx, next) => {
    const {data, db, query, params} = ctx;
    const {reason} = query;
    const {user} = data;
    const {recordId, pid} = params;
    const record = await db.XsfsRecordModel.findOnly({_id: recordId, pid});
    const post = await db.PostModel.findOnly({pid});
    const thread = await post.extendThread();
    const targetUser = await db.UserModel.findOnly({uid: post.uid});
    const forums = await thread.extendForums(['mainForums', 'minorForums']);
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of forums) {
        isModerator = await f.isModerator(user);
        if(isModerator) break;
      }
    }
    if(!isModerator) ctx.throw(400, '权限不足');
    data.isModerator = isModerator;
    if(reason.length < 2) ctx.throw(400, '撤销原因写的太少啦~');
    const oldXsf = targetUser.xsf;
    targetUser.xsf -= record.num;
    await targetUser.save();
    try{
      await record.updateOne(
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
		const {data, db, body, params, redis} = ctx;
		const {user} = data;
		const {pid} = params;
		let {num, description} = body;
    const creditScore = await db.SettingModel.getScoreByOperationType('creditScore');
    num = Number(num);
    if(num%1 !== 0) ctx.throw(400, `${creditScore.name}仅支持到小数点后两位`);
    const fromUser = user;
    const post = await db.PostModel.findOnly({pid});
		if(post.anonymous) ctx.throw(400, "无法鼓励匿名用户");
    const toUser = await db.UserModel.findOnly({uid: post.uid});
    if(fromUser.uid === toUser.uid) ctx.throw(400, '无法给自己鼓励');
    const thread = await db.ThreadModel.findOnly({tid: post.tid});
		if(thread.disabled) {
			ctx.throw(403,'文章已被封禁');
		}
		if(post.disabled) {
		  ctx.throw(403, '回复已被封禁');
    }
		const creditSettings = await db.SettingModel.getCreditSettings();
		await db.UserModel.updateUserScores(user.uid);
		const userScore = await db.UserModel.getUserScore(user.uid, creditScore.type);
		if(num < creditSettings.min) ctx.throw(400, `${creditScore.name}最少为${creditSettings.min/100}`);
		if(num > creditSettings.max) ctx.throw(400, `${creditScore.name}不能大于${creditSettings.max/100}`);
		// fromUser.kcb = await db.UserModel.updateUserKcb(fromUser.uid);
		if(userScore < num) ctx.throw(400, `你的${creditScore.name}不足`);
		if(description.length < 2) ctx.throw(400, '理由写的太少了');
    if(description.length > 60) ctx.throw(400, '理由不能超过60个字符');
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
		await post.updateOne({$push: {credits: updateObjForPost}});
    await thread.updateThreadEncourage();
    // 发消息
    const message = db.MessageModel({
      _id: await db.SettingModel.operateSystemID('messages', 1),
      r: toUser.uid,
      ty: 'STU',
      port: ctx.port,
      ip: ctx.address,
      c: {
        type: 'scoreTransfer',
        pid: post.pid,
        // userName: user.username,
        uid: user.uid,
        // kcb: num,
        number: num,
        // scoreName: creditScore.name,
        scoreType: creditScore.type,
        // threadTitle: post.t,
        description,
      }
    });
		await message.save();
    await ctx.nkcModules.socket.sendMessageToUser(message._id);
		await next();
	})
  .put("/kcb/:recordId", async (ctx, next) => {
    const {db, body, params} = ctx;
    const {recordId, pid} = params;
    const {hide} = body;
    await db.KcbsRecordModel.updateOne({
      _id: recordId,
      pid,
      type: "creditKcb"
    }, {
      $set: {
        hideDescription: !!hide
      }
    });
    await next();
  });

module.exports = router;
