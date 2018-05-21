const Router = require('koa-router');
const operationRouter = new Router();
const nkcModules = require('../../nkcModules');
const path = require('path');
const tools = require('../../tools');
const {upload, statics} = require('../../settings');
const {adPath, avatarPath, uploadPath} = upload;
const {defaultAdPath} = statics;
const {imageMagick} = tools;
operationRouter
// 收藏帖子
	.post('/addColl', async (ctx, next) => {
		const {tid} = ctx.params;
		const {db, data} = ctx;
		const {user} = data;
		const thread = await db.ThreadModel.findOnly({tid});
		if(thread.disabled) ctx.throw(403, '不能收藏已被封禁的帖子');
		if(!await thread.ensurePermission(ctx)) ctx.throw(403, '权限不足');
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
	// 首页置顶
	.patch('/ad', async (ctx, next) => {
		const {tid} = ctx.params;
		const {db, data, fs} = ctx;
		const thread = await db.ThreadModel.findOnly({tid});
		if(data.userLevel < 6) ctx.throw(403, '权限不足');
		if(thread.disabled) ctx.throw(404, '该贴子已被屏蔽，请先解除屏蔽再执行置顶操作');
		const setting = await db.SettingModel.findOnly({type: 'system'});
		const ads = setting.ads;
		const index = ads.findIndex((elem, i, arr) => elem === tid);
		const targetUser = await thread.extendUser();
		const targetAdPath = `${adPath}/${tid}.jpg`;
		if(index > -1) {
			ads.splice(index, 1);
			try{
				await fs.unlink(targetAdPath);
			} catch(e){}
		} else {
			if(ads.length === 6) {
				ads.shift();
			}
			ads.push(tid);
			const oc = await db.PostModel.findOnly({pid: thread.oc});
			let resourceArr = await oc.extendResources();
			let resource = resourceArr.find(elem => ['jpg', 'png', 'svg', 'jpeg'].indexOf(elem.ext.toLowerCase()) > -1);
			let filePath;
			if(resource) {
				filePath = `${uploadPath}${resource.path}`;
			} else {
				filePath = `${avatarPath}/${targetUser.uid}.jpg`;
			}
			await imageMagick.generateAdPost(filePath, targetAdPath);
		}
		await setting.update({ads});
		await next();
	})
	// 精华
	.patch('/digest', async (ctx, next) => {
		const {tid} = ctx.params;
		const {digest} = ctx.body;
		const {db, data} = ctx;
		const {user} = data;
		if(digest === undefined) ctx.throw(400, '参数不正确');
		const thread = await db.ThreadModel.findOnly({tid});
		if(!await thread.ensurePermissionOfModerators(ctx)) ctx.throw(403, '权限不足');
		if(thread.disabled) ctx.throw(400, '该贴子已被屏蔽，请先解除屏蔽再执行置顶操作');
		const obj = {digest: false};
		if(digest) {
			obj.digest = true;
		}
		if(thread.digest === digest) {
			if(!digest) ctx.throw(400, '该贴子在您操作前已经被撤销精华了，请刷新');
			if(digest) ctx.throw(400, '该贴子在您操作前已经被设置成精华了，请刷新');
		}
		await thread.update(obj);
		data.targetUser = await thread.extendUser();
		let operation = 'setDigest';
		if(!digest) operation = 'cancelDigest';
		await ctx.generateUsersBehavior({
			operation,
			tid,
			fid: thread.fid,
			isManageOp: true,
			toMid: thread.toMid,
			mid: thread.mid
		});
		await thread.updateThreadMessage();
		await next();
	})
	.patch('/topped', async (ctx, next) => {
		const {tid} = ctx.params;
		const {db, data} = ctx;
		const {topped} = ctx.body;
		const {user} = data;
		if(topped === undefined) ctx.throw(400, '参数不正确');
		const thread = await db.ThreadModel.findOnly({tid});
		if(!await thread.ensurePermissionOfModerators(ctx)) ctx.throw(403, '权限不足');
		if(thread.disabled) ctx.throw(400, '该贴子已被屏蔽，请先解除屏蔽再执行置顶操作');
		const obj = {topped: false};
		if(topped) obj.topped = true;
		await thread.update(obj);
		if(thread.topped === topped) {
			if(topped) ctx.throw(400, '该帖子在您操作前已经被置顶了，请刷新');
			if(!topped) ctx.throw(400, '该帖子在您操作前已经被取消置顶了，请刷新');
		}
		data.targetUser = await thread.extendUser();
		let operation = 'setTopped';
		if(!topped) operation = 'cancelTopped';
		await ctx.generateUsersBehavior({
			operation,
			tid,
			fid: thread.fid,
			isManageOp: true,
			toMid: thread.toMid,
			mid: thread.mid
		});
		await thread.updateThreadMessage();
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
		if(thread.recycleMark === true) ctx.throw(400, '该帖子已经被退回')
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
		const oldCid = targetThread.cid;
		// 版主只能改变帖子的分类，不能移动帖子到其他板块
		if(data.userLevel <= 4 && (fid === 'recycle' || (!oldForum.moderators.includes(user.uid) || fid !== oldForum.fid))) ctx.throw(403, '权限不足');
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
			await ctx.generateUsersBehavior({
				operation: 'moveToRecycle',
				tid,
				fid: targetThread.fid,
				isManageOp: true,
				toMid: targetThread.toMid,
				mid: targetThread.mid
			});
			// 添加删帖日志
			let oc = targetThread.oc;
			let post = await db.PostModel.findOne({"pid":oc})
			para.postedUsers = uidArray
			para.delUserId = targetThread.uid
			para.userId = user.uid;
			para.delPostTitle = post.t;
			const delLog = new db.DelPostLogModel(para);
			await delLog.save();
		}
		if(para.noticeType === true){
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