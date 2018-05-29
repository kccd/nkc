
const score = async (ctx, next) => {
	const {data, db} = ctx;
	const {user, targetUser, operationId, thread, post, forum} = data;
	const scoreSettings = await db.SettingModel.findOnly({type: 'score'});

	if(!scoreSettings.operationsId.includes(operationId)) return await next();

	const operation = await db.OperationModel.findOnly({_id: operationId});

	const obj = {
		operationId,
		score: operation.score,
		targetScore: operation.targetScore
	};

	if(user) obj.uid = user.uid;
	if(targetUser) obj.targetUid = targetUser.uid;
	if(thread) obj.tid = thread.tid;
	if(forum) obj.fid = forum.fid;
	if(post) obj.pid = post.pid;

	const newUserScore = db.UsersScoreLogModel(obj);
	await newUserScore.save();
	if(user) {
		await user.update({$inc: {score: obj.score}});
	}
	if(targetUser) {
		await targetUser.update({$inc: {score: obj.targetScore}});
	}
	await next();
};

module.exports = score;
