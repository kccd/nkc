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
    let {
      homeThreadList, searchPostList, searchAllList, userCardThreadList, threadPostList, forumThreadList,
      userCardUserList, forumUserList, searchThreadList, searchUserList, threadPostCommentList,
      searchColumnList
    } = pageSettings;
    threadPostCommentList = parseInt(threadPostCommentList);
    homeThreadList = parseInt(homeThreadList);
    searchPostList = parseInt(searchPostList);
    searchAllList = parseInt(searchAllList);
    searchThreadList = parseInt(searchThreadList);
    searchUserList = parseInt(searchUserList);
    threadPostList = parseInt(threadPostList);
    userCardUserList = parseInt(userCardUserList);
    userCardThreadList = parseInt(userCardThreadList);
    forumThreadList = parseInt(forumThreadList);
    forumUserList = parseInt(forumUserList);
    searchColumnList = parseInt(searchColumnList);
		await db.SettingModel.updateOne({_id: "page"}, {
      c: {
        homeThreadList,
        userCardThreadList,
        userCardUserList,
        threadPostCommentList,
        searchThreadList,
        searchPostList,
        searchAllList,
        searchUserList,
        forumThreadList,
        forumUserList,
        threadPostList,
        searchColumnList
      }
		});
		await next();
	});
module.exports = router;
