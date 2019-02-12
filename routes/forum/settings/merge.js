const Router = require('koa-router');
const mergeRouter = new Router();
mergeRouter
	.get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.forumList = await db.ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
    data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
		ctx.template = 'interface_forum_settings_merge.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, db, body, redis} = ctx;
		const {forum} = data;
    let {fid ,mergeForumId} = body;
    console.log(fid, mergeForumId);
    // 如果不是子专业，则不可合并与被合并
    let mergeForum = await db.ForumModel.findOnly({fid: mergeForumId});
    let mergeForumChildren = await mergeForum.extendChildrenForums();
    if(mergeForumChildren.length > 0) {
      ctx.throw(400, '被合并专业下存在下级专业，不可被合并');
    }
    let forumChildren = await forum.extendChildrenForums();
    if(forumChildren.length > 0) {
      ctx.throw(400, '当前专业下存在下级专业，不可合并其他专业');
    }
    // 
    let threads = await db.ThreadModel.find({parentsId: mergeForumId});
    
		// console.log(forum)
		await next();
	});
module.exports = mergeRouter;
