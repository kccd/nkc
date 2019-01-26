const Router = require('koa-router');
const router = new Router();
const rollback = require('./rollback');

router
  .get('/', async(ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    await targetThread.extendForums(['mainForums', 'minorForums']);
    await targetThread.ensurePermission(data.userRoles, data.userGrade, data.user);
    if(targetPost.hideHistories && !data.userOperationsId.includes('displayPostHideHistories')) ctx.throw(403,'权限不足');
    data.post = targetPost;
    data.histories = await db.HistoriesModel.find({pid}).sort({tlm: -1});
    data.targetUser = await targetPost.extendUser();
    ctx.template = 'interface_post_history.pug';
    await next();
  })
	.patch('/', async (ctx, next) => {
		const {body, db, params, data} = ctx;
		// if(data.userLevel < 6) ctx.throw(403, '权限不足');
		const {pid} = params;
		const {operation} = body;
		const targetPost = await db.PostModel.findOnly({pid});
		if(operation === 'disableHistories') {
			await targetPost.update({hideHistories: true});
		} else if(operation === 'unDisableHistories') {
			await targetPost.update({hideHistories: false});
		}
		await next();
	})
  .use('/rollback', rollback.routes(), rollback.allowedMethods());

module.exports = router;