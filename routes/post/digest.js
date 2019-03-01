const Router = require('koa-router');
const router = new Router();
router
	.post('/', async (ctx, next) => {
		const {db, data, params, nkcModules, body} = ctx;
		const {pid} = params;
		let {kcb} = body;
    const post = await db.PostModel.findOnly({pid});
    const thread = await post.extendThread();
    const forums = await thread.extendForums(['mainForums', 'minorForums']);
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of forums) {
        isModerator = await f.isModerator(data.user);
        if(isModerator) break;
      }
    }
    if(!isModerator) ctx.throw(403, '权限不足');
    data.isModerator = isModerator;
    data.post = post;
		const targetUser = await post.extendUser();
    const redEnvelopeSettings = await db.SettingModel.findOnly({_id: 'redEnvelope'});
    let num;
    if(!redEnvelopeSettings.c.draftFee.close) {
      if(!kcb) ctx.throw(400, '参数错误，请刷新');
      num = Number(kcb);
      if((num + '').indexOf('.') !== -1) ctx.throw(400, '仅支持整数');
      if(!redEnvelopeSettings.c.draftFee.close && (num < redEnvelopeSettings.c.draftFee.minCount || num > redEnvelopeSettings.c.draftFee.maxCount)) ctx.throw(400, '科创币数额不在范围内');
    }
		data.targetUser = targetUser;

    const usersGeneralSettings = await db.UsersGeneralModel.findOnly({uid: data.targetUser.uid});

		if(post.digest) {
			if(thread.oc === pid) {
				ctx.throw(400, '文章已被加精，请刷新');
			} else {
				ctx.throw(400, '回复已被加精，请刷新');
			}
		}
		const digestTime = Date.now();
		await post.update({digest: true, digestTime});
		const log = {
			user: targetUser,
			type: 'kcb',
			typeIdOfScoreChange: 'digestThread',
			port: ctx.port,
			pid,
			tid: thread.tid,
			ip: ctx.address
		};
		let message;
    const messageId = await db.SettingModel.operateSystemID('messages', 1);
		if(thread.oc === pid) {
			await thread.update({digest: true, digestTime});
			// await db.UsersScoreLogModel.insertLog(log);
      if(!redEnvelopeSettings.c.draftFee.close) {
        const record = db.KcbsRecordModel({
          _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
          from: 'bank',
          type: 'digestThreadAdditional',
          to: data.targetUser.uid,
          toc: digestTime,
          port: ctx.port,
          ip: ctx.address,
          description: '',
          num: num,
          pid,
          tid: thread.tid
        });
        await data.targetUser.update({$inc: {kcb: num}});
        await db.SettingModel.update({_id: 'kcb'}, {$inc: {'c.totalMoney': -1*num}});
        await record.save();
      }
      await db.KcbsRecordModel.insertSystemRecord('digestThread', data.targetUser, ctx);
			log.type = 'score';
			log.key = 'digestThreadsCount';
			await db.UsersScoreLogModel.insertLog(log);
			message = db.MessageModel({
				_id: messageId,
				ty: 'STU',
				r: post.uid,
				vd: false,
				c: {
					type: 'digestThread',
					targetUid: targetUser.uid,
					pid
				}
			});
			await message.save();
		} else {
			log.typeIdOfScoreChange = 'digestPost';
			// await db.UsersScoreLogModel.insertLog(log);
      if(!redEnvelopeSettings.c.draftFee.close) {
        const record = db.KcbsRecordModel({
          _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
          from: 'bank',
          type: 'digestPostAdditional',
          to: data.targetUser.uid,
          toc: digestTime,
          port: ctx.port,
          ip: ctx.address,
          description: '',
          num: num,
          pid,
          tid: thread.tid
        });
        await data.targetUser.update({$inc: {kcb: num}});
        await db.SettingModel.update({_id: 'kcb'}, {$inc: {'c.totalMoney': -1*num}});
        await record.save();
      }
      await db.KcbsRecordModel.insertSystemRecord('digestPost', data.targetUser, ctx);
			log.key = 'digestPostsCount';
			log.type = 'score';
			await db.UsersScoreLogModel.insertLog(log);
			message = db.MessageModel({
				_id: messageId,
				ty: 'STU',
				r: post.uid,
				vd: false,
				c: {
					type: 'digestPost',
					targetUid: targetUser.uid,
					pid
				}
			});
			await message.save();
		}
		if(!redEnvelopeSettings.c.draftFee.close) {
      await usersGeneralSettings.update({$inc: {'draftFeeSettings.kcb': num}});
    }
    await ctx.redis.pubMessage(message);
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: targetUser.uid});
		await userPersonal.increasePsnl('system', 1);
		await next();
	})
	.del('/', async (ctx, next) => {
		const {db, params, data} = ctx;
		const {pid} = params;
    const post = await db.PostModel.findOnly({pid});
    const thread = await post.extendThread();
    const forums = await thread.extendForums(['mainForums', 'minorForums']);
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of forums) {
        isModerator = await f.isModerator(data.user);
        if(isModerator) break;
      }
    }
    if(!isModerator) ctx.throw(400, '权限不足');
    data.isModerator = isModerator;
		const targetUser = await post.extendUser();
		data.targetUser = targetUser;
		data.post = post;
		if(!post.digest) {
			if(thread.oc === pid) {
				ctx.throw(400, '文章未被加精，请刷新');
			} else {
				ctx.throw(400, '回复未被加精，请刷新');
			}
		}
		let additionalReward = 0;
		const rewardLog = await db.KcbsRecordModel.findOne({type: 'digestThreadAdditional', pid}).sort({toc: -1});
		if(rewardLog) {
		  additionalReward = rewardLog.num;
    }
		await post.update({digest: false});
		const log = {
			user: targetUser,
			type: 'kcb',
			typeIdOfScoreChange: 'unDigestThread',
			port: ctx.port,
			pid,
			tid: thread.tid,
			ip: ctx.address
		};
		if(thread.oc === pid) {
			await thread.update({digest: false});
			// await db.UsersScoreLogModel.insertLog(log);
      await db.KcbsRecordModel.insertSystemRecord('unDigestThread', data.targetUser, ctx, additionalReward);
			log.type = 'score';
			log.change = -1;
			log.key = 'digestThreadsCount';
			await db.UsersScoreLogModel.insertLog(log);
		} else {
			log.typeIdOfScoreChange = 'unDigestPost';
			// await db.UsersScoreLogModel.insertLog(log);
      await db.KcbsRecordModel.insertSystemRecord('unDigestPost', data.targetUser, ctx, additionalReward);
			log.key = 'digestPostsCount';
			log.change = -1;
			log.type = 'score';
			await db.UsersScoreLogModel.insertLog(log);
		}
		await next();
	});
module.exports = router;