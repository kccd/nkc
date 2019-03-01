const Router = require('koa-router');
const router = new Router();
router
	.post('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		const {tid} = params;
		const thread = await db.ThreadModel.findOnly({tid});
    const mainForums = await thread.extendForums(['mainForums', 'minorForums']);
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of mainForums) {
        isModerator = await f.isModerator(user?user.uid: '');
        if(isModerator) break;
      }
    }
		if(!isModerator) {
			ctx.throw(403, '您没有权限给该文章加精');
		}
		if(thread.digest) ctx.throw(400, '文章已被设置精华');
		await thread.update({digest: true});
		const targetUser = await thread.extendUser();
		// 并生成记录
		await db.UsersScoreLogModel.insertLog({
			user: targetUser,
			type: 'kcb',
			typeIdOfScoreChange: 'digestThread',
			port: ctx.port,
			tid: thread.tid,
			ip: ctx.address
		});
		await db.UsersScoreLogModel.insertLog({
			user: targetUser,
			type: 'score',
			typeIdOfScoreChange: 'digestThread',
			port: ctx.port,
			ip: ctx.address,
			key: 'digestThreadsCount',
			tid: thread.tid
		});
		await next();
	})
	.del('/', async (ctx ,next) => {
		const {data, db, params} = ctx;
		const {user} = data;
		const {tid} = params;
		const thread = await db.ThreadModel.findOnly({tid});
    const mainForums = await thread.extendForums(['mainForums', 'minorForums']);
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of mainForums) {
        isModerator = await f.isModerator(user?user.uid: '');
        if(isModerator) break;
      }
    }
		if(!isModerator) {
      ctx.throw(400, '您没有权限给该文章取消加精');
		}
		if(!thread.digest) ctx.throw(400, '文章未被设置精华');
		await thread.update({digest: false});
		const targetUser = await thread.extendUser();
		// 并生成记录
		await db.UsersScoreLogModel.insertLog({
			user: targetUser,
			type: 'kcb',
			typeIdOfScoreChange: 'unDigestThread',
			port: ctx.port,
			tid: thread.tid,
			ip: ctx.address
		});
		await db.UsersScoreLogModel.insertLog({
			user: targetUser,
			type: 'score',
			change: -1,
			typeIdOfScoreChange: 'unDigestThread',
			port: ctx.port,
			ip: ctx.address,
			key: 'digestThreadsCount',
			tid: thread.tid
		});
		await next();
	});
module.exports = router;