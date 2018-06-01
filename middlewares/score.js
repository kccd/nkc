const score = async (ctx, next) => {
	const {data, db} = ctx;
	const {user, targetUser, operationId, thread, post, forum} = data;
	const scoreSettings = await db.SettingModel.findOnly({type: 'score'});
	if(!scoreSettings.operationsId.includes(operationId) || !user) return await next();

	const operation = await db.OperationModel.findOnly({_id: operationId});

	const obj = {
		operationId,
	};
	if(thread) obj.tid = thread.tid;
	if(forum) obj.fid = forum.fid;
	if(post) obj.pid = post.pid;
	if(user) obj.uid = user.uid;
	if(targetUser) obj.targetUid = targetUser.uid;
	// 学术分、科创币、积分
	const arr = ['kcb', 'xsf', 'score'];
	const today = ctx.nkcModules.apiFunction.today();
	for(const a of arr) {
		if(operation[a].status) {
			const {count, change, whoChange} = operation[a];
			let scoreChangedUser, todayCount;
			if(whoChange === 'me' && user) {
				scoreChangedUser = user;
				todayCount = await db.UsersScoreLogModel.count({uid: user.uid, operationId: operation._id, toc: {$gt: today}});
			} else if(whoChange === 'other' && targetUser) {
				scoreChangedUser = targetUser;
				todayCount = await db.UsersScoreLogModel.count({targetUid: targetUser.uid, operationId: operation._id, toc: {$gt: today}});
			}
			if(!scoreChangedUser || todayCount >= count) continue;
			const logObj = Object.assign({}, obj);
			logObj.change = change;
			logObj.whoChange = whoChange;
			logObj.type = a;
			const newLog = db.UsersScoreLogModel(logObj);
			await newLog.save();
			const updateObj = {};
			updateObj[a] = change;
			scoreChangedUser[a] += change;
			await scoreChangedUser.update({$inc: updateObj});
			if(a === 'score') {
				// 计算积分的函数
			}
		}
	}
	await next();
};

module.exports = score;
