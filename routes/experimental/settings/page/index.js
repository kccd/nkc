const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.pageSettings = (await db.SettingModel.findOnly({_id: 'page'})).c;
		ctx.template = 'experimental/settings/page.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const {pageSettings} = body;
    let {homeThreadList, userCardThreadList, forumThreadList, userCardUserList, forumUserList} = pageSettings;
    homeThreadList = parseInt(homeThreadList);
    userCardUserList = parseInt(userCardUserList);
    userCardThreadList = parseInt(userCardThreadList);
    forumThreadList = parseInt(forumThreadList);
    forumUserList = parseInt(forumUserList);
		await db.SettingModel.updateOne({_id: "page"}, {
      c: {
        homeThreadList,
        userCardThreadList,
        userCardUserList,
        forumThreadList,
        forumUserList
      }
		});
		await next();
	});
module.exports = router;
