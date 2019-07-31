const Router = require('koa-router');
const operationRouter = new Router();
operationRouter
  // 收藏文章
  .post("/collection", async (ctx, next) => {
    const {body, params, db, data} = ctx;
    const {tid} = params;
    const {type, cid = []} = body;
    const {user} = data;
    const thread = await db.ThreadModel.findOnly({tid});
    if(thread.disabled) ctx.throw(403, '不能收藏已被封禁的文章');
    await thread.extendForums(['mainForums', 'minorForums']);
    await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
    let collection = await db.SubscribeModel.findOne({tid: tid, uid: user.uid, type: "collection"});
    if(type) {
      if(collection) ctx.throw(400, "文章已收藏，请勿重复提交");
      for(const typeId of cid) {
        const subType = await db.SubscribeTypeModel.findOne({_id: typeId, uid: user.uid});
        if(!subType) ctx.throw(400, `未找到ID为${typeId}的关注分类`);
      }
      collection = db.SubscribeModel({
        _id: await db.SettingModel.operateSystemID("subscribes", 1),
        uid: user.uid,
        tid,
        cid,
        type: "collection"
      });
      await collection.save();
      await db.SubscribeTypeModel.updateCount(cid);
    } else {
      if(!collection) ctx.throw(400, "文章未在收藏夹中，请刷新");
      const {cid} = collection;
      await collection.remove();
      await db.SubscribeTypeModel.updateCount(cid);
    }
    await db.SubscribeModel.saveUserCollectionThreadsId(user.uid);
    data.targetUser = await thread.extendUser();
    await next();
  })
	/*.post('/addColl', async (ctx, next) => {
		const {tid} = ctx.params;
		const {db, data} = ctx;
		const {user} = data;
		const thread = await db.ThreadModel.findOnly({tid});
		if(thread.disabled) ctx.throw(403, '不能收藏已被封禁的文章');
		await thread.extendForums(['mainForums', 'minorForums']);

		await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
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
			// await db.SettingModel.operateSystemID('collections', -1);
			ctx.throw(500, `收藏失败: ${err}`);
		}
		data.targetUser = await thread.extendUser();
		await next();
	})
	.post('/delColl', async(ctx, next) => {
		const {tid} = ctx.params;
		const {db, data} = ctx;
		const {user} = data;
		const collection = await db.CollectionModel.findOne({tid: tid, uid: user.uid});
    if(!collection) ctx.throw(403,'抱歉，你尚未收藏该文章');
    await collection.remove();
    await next();
	})*/
  // 修改退修原因
  .patch("/moveDraft/reason", async (ctx, next) => {
    const {body, db} = ctx;
    const {log} = body;
    if(!log.reason) ctx.throw(400, "退修原因不能为空");
    await db.DelPostLogModel.updateOne({
      _id: log._id
    }, {
      $set: {
        reason: log.reason
      }
    });

    let mType, obj = {
      ty: "STU"
    };
    if(log.postType === "thread") {
      mType = "threadWasReturned";
      obj[`c.tid`] = log.threadId;
    } else {
      mType = "postWasReturned";
      obj[`c.pid`] = log.postId;
    }
    obj[`c.type`] = mType;

    await db.MessageModel.updateOne(obj, {
      $set: {
        "c.rea": log.reason
      }
    });
    await next();
  })
  // 退修
	.patch('/moveDraft', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const {tid} = ctx.params;
		let {fid, cid, para} = ctx.body;
		if(tid === undefined) ctx.throw(400, '参数不正确');
		// 根据tid添加退回标记
		let thread = await db.ThreadModel.findOne({tid});
    if(thread.type === "fund") ctx.throw(403, "科创基金类文章无法退修");
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      const forums = await thread.extendForums(['mainForums']);
      for(const f of forums) {
        isModerator = await f.isModerator(user);
        if(isModerator) break;
      }
    }
    if(!isModerator) ctx.throw(403, '权限不足');
		data.targetUser = await thread.extendUser();
		if(thread.recycleMark === true || thread.fid === "recycle") ctx.throw(400, '该文章已经被退回')
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

      const mId = await db.SettingModel.operateSystemID('messages', 1);
      const message = db.MessageModel({
        _id: mId,
        ty: 'STU',
        r: thread.uid,
        c: {
          type: 'threadWasReturned',
          tid: thread.tid,
          rea: para.reason
        }
      });
      await message.save();
      await ctx.redis.pubMessage(message);
		}
		if(para && para.illegalType) {
			await db.UsersScoreLogModel.insertLog({
				user: data.targetUser,
				type: 'score',
				typeIdOfScoreChange: 'violation',
				port: ctx.port,
				ip: ctx.address,
				key: 'violationCount',
				description: para.reason || '退回文章并标记为违规'
			});
      await db.KcbsRecordModel.insertSystemRecord('violation', data.targetUser, ctx);
		}
		if(!thread.reviewed) await db.ReviewModel.newReview("returnThread", post, user, para.reason);
		await next()
	})
  // 移动到回收站
	.patch('/moveThread', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const {tid} = ctx.params;
    let {fid, cid, para} = ctx.body;
		if(fid === undefined) ctx.throw(400, '参数不正确');
    if(cid === undefined) cid = 0;
    if(fid !== 'recycle') ctx.throw(403, '参数错误');
		const targetForum = await db.ForumModel.findOne({fid});
		const targetCategory = await db.ThreadTypeModel.findOne({cid});
		if(!targetCategory) cid = 0;
		if(!targetForum || (targetCategory && targetForum.fid !== targetCategory.fid)) ctx.throw(400, '参数不正确');
		const targetThread = await db.ThreadModel.findOnly({tid});
		data.targetUser = await targetThread.extendUser();
    const oldForums = await targetThread.extendForums(['mainForums']);
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of oldForums) {
        isModerator = await f.isModerator(user);
        if(isModerator) break;
      }
    }
		if(!isModerator) ctx.throw(403, '权限不足');
		const oldCid = targetThread.cid;
		// 版主只能改变文章的分类，不能移动文章到其他板块
		// if(!data.userOperationsId.includes('moveThread') && fid === 'recycle' && fid !== oldForum.fid) ctx.throw(403, '权限不足');
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
    await targetThread.update({mainForumsId: ['recycle'], disabled: true, reviewed: true});
    await Promise.all(oldForums.map(async forum => {
      await forum.updateForumMessage();
    }));
    await db.PostModel.updateOne({pid: targetThread.oc}, {
      $set: {
        reviewed: true
      }
    });
    await targetThread.updateThreadMessage();
    await targetForum.updateForumMessage();
    /*
		let status = 0;
		 try {
      const q = {
        mainForumsId: ['recycle']
      };
			q.disabled = true;
			await targetThread.update(q);
			status++;
			await db.PostModel.updateMany({tid}, {$set: {mainForumsId: ['recycle']}});
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
			ctx.throw(500, `移动文章失败： ${err}`);
		} 
		await targetThread.updateThreadMessage();
		await targetForum.updateForumMessage();*/
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
      await db.KcbsRecordModel.insertSystemRecord('threadBlocked', data.targetUser, ctx);
      if(para && para.illegalType) {
				await db.UsersScoreLogModel.insertLog({
					user: data.targetUser,
					type: 'score',
					typeIdOfScoreChange: 'violation',
					port: ctx.port,
					ip: ctx.address,
					key: 'violationCount',
					tid: targetThread.tid,
					description: para.reason || '屏蔽文章并标记为违规'
				});
        await db.KcbsRecordModel.insertSystemRecord('violation', data.targetUser, ctx);
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
      if(para && para.noticeType) {
        const mId = await db.SettingModel.operateSystemID('messages', 1);
        const message = db.MessageModel({
          _id: mId,
          ty: 'STU',
          r: targetThread.uid,
          c: {
            type: 'bannedThread',
            tid: targetThread.tid,
            rea: para?para.reason:''
          }
        });
        await message.save();
        await ctx.redis.pubMessage(message);
      }


      if(!targetThread.reviewed) await db.ReviewModel.newReview("disabledThread", post, user, para.reason);
    }
		if(para && para.noticeType === true){
			let uid = targetThread.uid;
			const toUser = await db.UsersPersonalModel.findOnly({uid});
			await toUser.increasePsnl('system', 1);
		}
		await next();
  })
  .patch('/forum', async (ctx, next) => {
    const {params, db, body} = ctx;
    const {fromFid, toFid, toCid} = body;
    const {tid} = params;
    if(toFid === 'recycle') ctx.throw(400, '如需移动文章到回收站请点击“送回收站”按钮');
    const thread = await db.ThreadModel.findOnly({tid});
    const fromForum = await db.ForumModel.findOnly({fid: fromFid});
    const childForumsCount = await db.ForumModel.count({parentsId: fromFid});
    if(childForumsCount !== 0) ctx.throw('当前所在专业不为最底层专业，请进入最底层专业再执行此操作');
    const toForum = await db.ForumModel.findOne({fid: toFid});
    if(!toForum) ctx.throw(400, '目标专业不存在');
    if(toCid) {
      const toForumType = await db.ThreadTypeModel.findOne({fid: toFid, cid: toCid});
      if(!toForumType) ctx.throw(400, '目标专业的文章分类不存在');
    }
    let {mainForumsId, categoriesId} = thread;
    const fromIndex = mainForumsId.indexOf(fromFid);
    if(fromIndex !== -1) mainForumsId.splice(fromIndex, 1);
    if(!mainForumsId.includes(toFid)) {
      mainForumsId.push(toFid);
    }
    const formTypes = await db.ThreadTypeModel.find({fid: fromFid});
    const fromTypesId = formTypes.map(t => t.cid + '');
    categoriesId = categoriesId.filter(cid => !fromTypesId.includes(cid));
    if(toCid && !categoriesId.includes(toCid + '')) {
      categoriesId.push(toCid);
    }
    await thread.update({mainForumsId, categoriesId});
    await db.PostModel.updateMany({tid}, {$set: {mainForumsId}});
    await db.InfoBehaviorModel.updateMany({tid}, {$set: {mainForumsId}});
    await fromForum.updateForumMessage();
    await toForum.updateForumMessage();
    await next();
  })
  .post('/forum', async (ctx, next) => {
    const {data, db, body, params} = ctx;
    const {tid} = params;
    const thread = await db.ThreadModel.findOnly({tid});
    await thread.extendForums(['mainForums', 'minorForums']);
    await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
    const {fid, cid} = body;
    if(fid === 'recycle') ctx.throw(403, '无法将文章移动至回收站，请点击“送回收站”按钮');
    const forum = await db.ForumModel.findOne({fid});
    if(!forum) ctx.throw(400, '目标专业不存在');
    const forumThreadTypes = await db.ThreadTypeModel.find({fid});
    const cids = forumThreadTypes.map(c => c.cid + '');
    const categoriesId = thread.categoriesId.filter(c => !cids.includes(c));
    const childForumsCount = await db.ForumModel.count({parentsId: fid});
    if(childForumsCount !== 0) ctx.throw(400, '只能给文章添加最底层的专业作为分类');
    if(cid) {
      const category = await db.ThreadTypeModel.findOne({cid, fid});
      if(!category) ctx.throw(400, '所选的文章分类不存在');
    }
    const forums = await thread.extendForums(['mainForums']);
    forums.push(forum);
    const obj = {
      mainForumsId: fid
    };
    if(cid) {
      categoriesId.push(cid + '');
    }
    await thread.update({$addToSet: obj, categoriesId: [...new Set(categoriesId)]});
    await db.PostModel.updateMany({tid}, {$addToSet: {mainForumsId: fid}});
    await db.InfoBehaviorModel.updateMany({tid}, {$addToSet: {mainForumsId: fid}});
    await Promise.all(forums.map(async forum => {
      await forum.updateForumMessage();
    }));
    await next();
  })
  .del('/forum', async (ctx, next) => {
    const {data, query, db, params} = ctx;
    const {tid} = params;
    const {fid} = query;
    const thread = await db.ThreadModel.findOnly({tid});
    await thread.extendForums(['mainForums', 'minorForums']);
    await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
    if(!thread.mainForumsId.includes(fid)) ctx.throw(400, '当前文章不属于该专业，请刷新');
    const forums = await thread.extendForums(['mainForums']);
    if(forums.length === 1) ctx.throw(403, '文章所属的专业暂不能为空');
    const threadTypes = await db.ThreadTypeModel.find({fid});
    const cids = threadTypes.map(t => t.cid);
    let {categoriesId} = thread;
    categoriesId = categoriesId.filter(cid => !cids.includes(cid));
    const updateObj = {
      $pull: {mainForumsId: fid},
      categoriesId
    };
    if(fid === "recycle") {
      updateObj.disabled = false;
    }
    await thread.update(updateObj);
    await db.PostModel.updateMany({tid}, {$pull: {mainForumsId: fid}});
    await db.InfoBehaviorModel.updateMany({tid}, {$pull: {mainForumsId: fid}});
    await Promise.all(forums.map(async forum => {
      await forum.updateForumMessage();
    }));
    await next();
  });

module.exports = operationRouter;