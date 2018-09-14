const Router = require('koa-router');
const router = new Router();
router
	.post('/', async (ctx, next) => {
		const {db, data, params, nkcModules} = ctx;
		const {pid} = params;
		const post = await db.PostModel.findOnly({pid});
		const targetUser = await post.extendUser();
		data.targetUser = targetUser;
		const thread = await db.ThreadModel.findOnly({tid: post.tid});
		if(post.digest) {
			if(thread.oc === pid) {
				ctx.throw(400, '文章已被加精，请刷新');
			} else {
				ctx.throw(400, '回复已被加精，请刷新');
			}
		}
		await post.update({digest: true});
		const log = {
			user: targetUser,
			type: 'kcb',
			typeIdOfScoreChange: 'digestThread',
			port: ctx.port,
			pid,
			fid: thread.fid,
			tid: thread.tid,
			ip: ctx.address
		};
		let message;
    const messageId = await db.SettingModel.operateSystemID('messages', 1);
		if(thread.oc === pid) {
			await thread.update({digest: true});
			await db.UsersScoreLogModel.insertLog(log);
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
			await db.UsersScoreLogModel.insertLog(log);
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
    await ctx.redis.pubMessage(message);
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: targetUser.uid});
		await userPersonal.increasePsnl('system', 1);
		await next();
	})
	.del('/', async (ctx, next) => {
		const {db, params, data} = ctx;
		const {pid} = params;
		const post = await db.PostModel.findOnly({pid});
		const targetUser = await post.extendUser();
		data.targetUser = targetUser;
		const thread = await db.ThreadModel.findOnly({tid: post.tid});
		if(!post.digest) {
			if(thread.oc === pid) {
				ctx.throw(400, '文章未被加精，请刷新');
			} else {
				ctx.throw(400, '回复未被加精，请刷新');
			}
		}
		await post.update({digest: false});
		const log = {
			user: targetUser,
			type: 'kcb',
			typeIdOfScoreChange: 'unDigestThread',
			port: ctx.port,
			pid,
			fid: thread.fid,
			tid: thread.tid,
			ip: ctx.address
		};
		if(thread.oc === pid) {
			await thread.update({digest: false});
			await db.UsersScoreLogModel.insertLog(log);
			log.type = 'score';
			log.change = -1;
			log.key = 'digestThreadsCount';
			await db.UsersScoreLogModel.insertLog(log);
		} else {
			log.typeIdOfScoreChange = 'unDigestPost';
			await db.UsersScoreLogModel.insertLog(log);
			log.key = 'digestPostsCount';
			log.change = -1;
			log.type = 'score';
			await db.UsersScoreLogModel.insertLog(log);
		}
		await next();
	});
module.exports = router;