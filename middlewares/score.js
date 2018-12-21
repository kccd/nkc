const score = async (ctx, next) => {
	const {data, db} = ctx;
	const {user, operationId, thread, post, forum} = data;
	let {targetUser} = data;
	const scoreSettings = await db.SettingModel.findOnly({_id: 'score'});
	if(!scoreSettings.c.operationsId.includes(operationId) || !user) return await next();
	if(operationId !== 'modifyUsername') return await next();
	const operation = await db.OperationModel.findOnly({_id: operationId});

	const obj = {
		operationId,
	};
	if(thread) obj.tid = thread.tid;
	if(forum) obj.fid = forum.fid;
	if(post) obj.pid = post.pid;
	if(user) obj.uid = user.uid;
	if(targetUser) obj.targetUid = targetUser.uid;
	// 学术分、科创币
	const arr = ['xsf', 'kcb'];
	const today = ctx.nkcModules.apiFunction.today();

	for(const a of arr) {
		if(!operation[a].status) continue;
		if(!user && !targetUser) continue;
		let {count, targetCount, change, targetChange} = operation[a];
		let userLogCount, targetUserLogCount;
		if(user) {
			userLogCount = await db.UsersScoreLogModel.count({uid: user.uid, type: a, operationId: operation._id, toc: {$gt: today}});
		}
		if(targetUser) {
			targetUserLogCount = await db.UsersScoreLogModel.count({targetUid: targetUser.uid, type: a, operationId: operation._id, toc: {$gt: today}});
		}

		if(userLogCount < count || count === -1 || targetCount === -1 || targetUserLogCount < targetCount) {

			// 存在操作者与被操作者的次数不相等的情况，将次数为0的一方分值设为0，虽然会参与计算但不回影响最后的结果。

			if(userLogCount >= count && count !== -1) change = 0;

			if(targetUserLogCount >= targetCount && targetCount !== -1) targetChange = 0;

			const logObj = Object.assign({}, obj);

			logObj.type = a;
			logObj.uid = user?user.uid: '';
			if(!targetUser) {

				// 若为科创币的交易，不存在被操作者时，被操作者为默认账户（科创人民银行）
				if(a === 'kcb') {
					const kcbSettings = await db.SettingModel.findOnly({_id: 'kcb'});
					const {defaultUid} = kcbSettings.c;
					targetUser = await db.UserModel.findOnly({uid: defaultUid});
					logObj.targetUid = defaultUid;
				} else {
					logObj.targetUid = '';
				}
			} else {
				logObj.targetUid = targetUser.uid;
			}

			logObj.change = change;
			logObj.targetChange = targetChange;
			logObj.ip = ctx.address;
			logObj.port = ctx.port;

			const newLog = db.UsersScoreLogModel(logObj);
			await newLog.save();

			if(user && change) {
				const o = {};
				o[a] = change;
				await user.update({$inc: o});
				user[a] += change;
			}
			if(targetUser && targetChange) {
				const o = {};
				o[a] = targetChange;
				await targetUser.update({$inc: o});
				targetUser[a] += targetChange;
			}
		}
	}
	await next();
};

module.exports = score;
