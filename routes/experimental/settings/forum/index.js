const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.disciplines = await db.ForumModel.find({parentsId: [], forumType: "discipline"}).sort({order: 1});
		data.topics = await db.ForumModel.find({parentsId: [], forumType:"topic"}).sort({order: 1});
		data.type = 'forum';
		ctx.template = 'experimental/settings/forum.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const {fidArr, forumType} = body;
		const forums = await db.ForumModel.find({parentsId: [], forumType:forumType}).sort({order: 1});
		if(fidArr.length !== forums.length) {
			ctx.throw(400, '参数错误');
		}
		for(let forum of forums) {
			if(!fidArr.includes(forum.fid)) {
				ctx.throw(400, '参数错误');
			}
		}
		for(let forum of forums) {
			const order = fidArr.indexOf(forum.fid);
			await forum.update({order});
		}
		await next();
	});
module.exports = router;