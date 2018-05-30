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

	// 学术分、科创币
	const arr = ['kcb', 'xsf'];
	const today = ctx.nkcModules.apiFunction.today();
	for(const a of arr) {
		if(operation[a].status) {
			const {number, count, targetNumber} = operation[a];
			if(number !== 0) {
				const todayCount = await db.UsersScoreLogModel.count({uid: user.uid, type: a, operationId: operationId, toc: {$gt: today}});
				if(count!== -1 && todayCount >= count) continue;
				const updateObj = {};
				updateObj[a] = number;
				await user.update({$inc: updateObj});
				const logObj = Object.assign({}, obj);
				logObj.uid = user.uid;
				logObj.type = a;
				logObj.change = number;
				const newLog = db.UsersScoreLogModel(logObj);
				await newLog.save();
			}
			if(targetUser && targetNumber !== 0) {
				const todayCount = await db.UsersScoreLogModel.count({uid: targetUser.uid, type: a, operationId: operationId, toc: {$gt: today}});
				if(count!== -1 && todayCount >= count) continue;
				const updateObj = {};
				updateObj[a] = targetNumber;
				await targetUser.update({$inc: updateObj});
				const logObj = Object.assign({}, obj);
				logObj.uid = targetUser.uid;
				logObj.type = a;
				logObj.change = targetNumber;
				const newLog = db.UsersScoreLogModel(logObj);
				await newLog.save();
			}
		}
	}

	// 积分计算
	if(operation.score.status) {
		const {number, targetNumber, count} = operation.score;
		if(number !== 0) {
			const todayCount = await db.UsersScoreLogModel.count({uid: user.uid, type: 'score', operationId: operationId, toc: {$gt: today}});
			if(count === -1 || todayCount < count) {
				const logObj = Object.assign({}, obj);
				logObj.uid = user.uid;
				logObj.type = 'score';
				logObj.change = number;
				const newLog = db.UsersScoreLogModel(logObj);
				await newLog.save();
				await user.calculateScore();
			}
		}
		if(targetNumber !== 0 && targetUser) {
			const todayCount = await db.UsersScoreLogModel.count({uid: targetUser.uid, type: 'score', operationId: operationId, toc: {$ne: today}});
			if(count === -1 || todayCount < count) {
				const logObj = Object.assign({}, obj);
				logObj.uid = targetUser.uid;
				logObj.type = 'score';
				logObj.change = targetNumber;
				const newLog = db.UsersScoreLogModel(logObj);
				await newLog.save();
				await targetUser.calculateScore();
			}
		}
	}
	await next();
};

module.exports = score;
