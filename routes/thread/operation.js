const Router = require('koa-router');
const operationRouter = new Router();
operationRouter
// 收藏帖子
	.post('/addColl', async (ctx, next) => {
		const {tid} = ctx.params;
		const {db, data} = ctx;
		const {user} = data;
		const thread = await db.ThreadModel.findOnly({tid});
		if(thread.disabled) ctx.throw(403, '不能收藏已被封禁的帖子');
		await thread.extendForum();
		const gradeId = data.userGrade._id;
		const rolesId = data.userRoles.map(r => r._id);
		const options = {
			gradeId,
			rolesId,
			uid: user?user.uid: ''
		};
		await thread.ensurePermission(options);
		const collection = await db.CollectionModel.findOne({tid: tid, uid: user.uid});
		if(collection) ctx.throw(400, '该贴子已经存在于您的收藏中，没有必要重复收藏');
		const newCollection = new db.CollectionModel({
			cid: await db.SettingModel.operateSystemID('collections', 1),
			tid: tid,
			uid: user.uid
		});
		try{
			await newCollection.save();
		} catch (err) {
			await db.SettingModel.operateSystemID('collections', -1);
			ctx.throw(500, `收藏失败: ${err}`);
		}
		data.targetUser = await thread.extendUser();
		await next();
	})
	.patch('/moveDraft', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const {tid} = ctx.params;
		let {fid, cid, para} = ctx.body;
		if(tid === undefined) ctx.throw(400, '参数不正确')
		// 根据tid添加退回标记
		let thread = await db.ThreadModel.findOne({tid})
		data.targetUser = await thread.extendUser();
		if(thread.recycleMark === true || thread.fid === "recycle") ctx.throw(400, '该帖子已经被退回')
		await thread.update({recycleMark:true})
		// 获取主题帖的第一条回帖的标题和内容
		let oc = thread.oc;
		let post = await db.PostModel.findOne({"pid":oc})
		// 添加删帖日志
		para.delUserId = thread.uid
		para.userId = user.uid;
		para.delPostTitle = post.t
		para.postId = oc
    const delLog = new db.DelPostLogModel(para);
		await delLog.save();
		if(para.noticeType === true){
			let uid = thread.uid;
			const toUser = await db.UsersPersonalModel.findOnly({uid});
			await toUser.increasePsnl('system', 1);
		}
		if(para && para.illegalType) {
			const log = db.UsersScoreLogModel({
				uid: user.uid,
				type: 'score',
				operationId: 'violation',
				description: '退回文章并标记为违规',
				change: 0,
				targetCount: 1,
				targetUid: data.targetUser.uid,
				tid,
				fid: thread.fid
			});
			await log.save();
			data.targetUser.violation++;
			await data.targetUser.update({$inc: {violationCount: 1}});
			await data.targetUser.calculateScore();
		}
		await next()
	})
	.patch('/moveThread', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const {tid} = ctx.params;
		let {fid, cid, para} = ctx.body;
		if(fid === undefined) ctx.throw(400, '参数不正确');
		if(cid === undefined) cid = 0;
		const targetForum = await db.ForumModel.findOne({fid});
		const targetCategory = await db.ThreadTypeModel.findOne({cid});
		if(!targetCategory) cid = 0;
		if(!targetForum || (targetCategory && targetForum.fid !== targetCategory.fid)) ctx.throw(400, '参数不正确');
		const targetThread = await db.ThreadModel.findOnly({tid});
		data.targetUser = await targetThread.extendUser();
		const oldForum = await targetThread.extendForum();
		const isModerator = await oldForum.isModerator();
		if(!isModerator && !data.userOperationsId.includes('moveThread')) ctx.throw(403, '权限不足');
		const oldCid = targetThread.cid;
		// 版主只能改变帖子的分类，不能移动帖子到其他板块
		if(!data.userOperationsId.includes('moveThread') && fid === 'recycle' && fid !== oldForum.fid) ctx.throw(403, '权限不足');
		// if(data.userLevel <= 4 && (fid === 'recycle' || (!oldForum.moderators.includes(user.uid) || fid !== oldForum.fid))) ctx.throw(403, '权限不足');
		const tCount = {
			digest: 0,
			normal: 0
		};
		if(targetThread.digest) {
			tCount.digest = 1;
		} else {
			tCount.normal = 1;
		}
		let status = 0;
		try {
			const q = {cid, fid};
			q.disabled = (q.fid === 'recycle');
			await targetThread.update(q);
			status++;
			await db.PostModel.updateMany({tid}, {$set: {fid}});
			status++;
			await oldForum.update({$inc: {'tCount.digest': -1*tCount.digest, 'tCount.normal': -1*tCount.normal}});
			status++;
			await targetForum.update({$inc: {'tCount.digest': tCount.digest, 'tCount.normal': tCount.normal}});
		} catch (err) {
			if(status >= 0) {
				await targetThread.update({cid: oldCid, fid: oldForum.fid});
			}
			if(status >= 1) {
				await db.PostModel.updateMany({tid}, {$set: {fid: oldForum.fid}});
			}
			if(status >= 2) {
				await oldForum.update({$inc: {'tCount.digest': tCount.digest, 'tCount.normal': tCount.normal}});
			}
			if(status === 3) {
				await targetForum.update({$inc: {'tCount.digest': -1*tCount.digest, 'tCount.normal': -1*tCount.normal}});
			}
			ctx.throw(500, `移动帖子失败： ${err}`);
		}
		await targetThread.updateThreadMessage();
		await targetForum.updateForumMessage();
		// 获取某主帖下全部的回帖用户
		let posts = await db.PostModel.find({"tid":tid},{"uid":1})
		// 用户id去重
		let uidArray = [];
		let h = {};
		for(var i=0;i<posts.length;i++){
			if(!h[posts[i].uid]){
				uidArray.push(posts[i].uid)
				h[posts[i].uid] = 1;
			}
		}
		if(fid === 'recycle') {
			if(para && para.illegalType) {
				const log = db.UsersScoreLogModel({
					uid: user.uid,
					type: 'score',
					operationId: 'violation',
					description: '屏蔽文章并标记为违规',
					change: 0,
					targetCount: 1,
					targetUid: data.targetUser.uid,
					tid,
					fid: targetThread.fid
				});
				await log.save();
				data.targetUser.violation++;
				await data.targetUser.update({$inc: {violationCount: 1}});
				await data.targetUser.calculateScore();
			}
			// 添加删帖日志
			let oc = targetThread.oc;
			let post = await db.PostModel.findOne({"pid":oc})
			if(para){
				para.postedUsers = uidArray
				para.delUserId = targetThread.uid
				para.userId = user.uid;
				para.delPostTitle = post.t;
				const delLog = new db.DelPostLogModel(para);
				await delLog.save();
			}
		}
		if(para && para.noticeType === true){
			let uid = targetThread.uid;
			const toUser = await db.UsersPersonalModel.findOnly({uid});
			await toUser.increasePsnl('system', 1);
		}
		await next();
	})
	.patch('/switchInPersonalForum', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const {tid} = ctx.params;
		const {hideInMid, toppedInMid, digestInMid} = ctx.body;
		const targetThread = await db.ThreadModel.findOnly({tid});
		const {mid, toMid} = targetThread;
		let targetPersonalForum = {};
		let targetUser = {};
		if(mid) {
			targetPersonalForum = await db.PersonalForumModel.findOnly({uid: mid});
			targetUser = await db.UserModel.findOnly({uid: mid});
		} else if(toMid) {
			targetPersonalForum = await db.PersonalForumModel.findOnly({uid: toMid});
			targetUser = await db.UserModel.findOnly({uid: toMid});
		} else {
			ctx.throw(400, '该贴子不在任何人的专栏');
		}
		if(targetUser.uid !== user.uid && !targetPersonalForum.moderators.includes(user.uid)) ctx.throw(403, '权限不足');
		const obj = {};
		if(hideInMid !== undefined) obj.hideInMid = !!hideInMid;
		if(digestInMid !== undefined) obj.digestInMid = !!digestInMid;
		if(toppedInMid !== undefined) {
			if(toppedInMid){
				obj.$addToSet = {toppedUsers: user.uid};
				await targetPersonalForum.update({$addToSet: {toppedThreads: tid}});
			} else {
				obj.$pull = {toppedUsers: user.uid};
				await targetPersonalForum.update({$pull: {toppedThreads: tid}});
			}
		}
		await targetThread.update(obj);
		data.targetuser = targetUser;
		await next();
	});

module.exports = operationRouter;