const Router = require('koa-router');
const router = new Router();
router
	.post('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {tid} = params;
		const {user} = data;
    const thread = await db.ThreadModel.findOnly({tid});
    const forums = await thread.extendForums(['mainForums', 'minorForums']);
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of forums) {
        isModerator = await f.isModerator(user?user.uid: '');
        if(isModerator) break;
      }
    }
		if(!isModerator) {
			ctx.throw(403, '您没有权限给该文章设置置顶');
		}
		if(thread.topped) ctx.throw(400, '该文章已被设置置顶');
		await thread.update({topped: true});
		await next();
	})
	.del('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {tid} = params;
		const {user} = data;
		const thread = await db.ThreadModel.findOnly({tid});
    const forums = await thread.extendForums(['mainForums', 'minorForums']);
    let isModerator = ctx.permission('superModerator');
    if(!isModerator) {
      for(const f of forums) {
        isModerator = await f.isModerator(user?user.uid: '');
        if(isModerator) break;
      }
    }
		if(!isModerator) {
			ctx.throw(403, '您没有权限取消给该文章设置置顶');
		}
		if(!thread.topped) ctx.throw(400, '该文章未被设置置顶');
		await thread.update({topped: false});
		await next();
	});
module.exports = router;