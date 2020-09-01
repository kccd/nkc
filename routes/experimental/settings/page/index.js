const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.pageSettings = await db.SettingModel.getSettings('page');
		ctx.template = 'experimental/settings/page/page.pug';
		await next();
	})
	.put('/', async (ctx, next) => {
		const {db, body} = ctx;
		const {pageSettings} = body;
    let {
      homeThreadList, searchPostList, searchAllList, userCardThreadList, threadPostList, forumThreadList,
      userCardUserList, forumUserList, searchThreadList, searchUserList, threadPostCommentList,
      searchColumnList, searchResourceList, threadListStyle,
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
    searchResourceList = parseInt(searchResourceList);
    if(!['abstract', 'brief', 'minimalist'].includes(threadListStyle.type)) ctx.throw(400, `文章列表显示模式错误 type: ${threadListStyle.type}`);
    if(!['left', 'right', 'null'].includes(threadListStyle.cover)) ctx.throw(400, `文章列表封面图错误 cover: ${threadListStyle.cover}`);
		await db.SettingModel.updateOne({_id: "page"}, {
      c: {
        homeThreadList,
        userCardThreadList,
        userCardUserList,
        threadPostCommentList,
        searchThreadList,
        searchPostList,
        searchResourceList,
        searchAllList,
        searchUserList,
        forumThreadList,
        forumUserList,
        threadPostList,
        searchColumnList,
        threadListStyle,
      }
		});
		await db.SettingModel.saveSettingsToRedis("page");
		await next();
	});
module.exports = router;
