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
	.put('/', async (ctx, next) => {
		const {data, db, body, redis} = ctx;
		const {forum} = data;
    let {fid ,mergeForumId} = body;
    // 如果不是子专业，则不可合并与被合并
    // 也不可以自己合并至自己
    if(fid == mergeForumId) {
      ctx.throw(400, '目标专业与当前专业不可相同');
    }
    let targetForum = await db.ForumModel.findOne({fid:mergeForumId});
    let targetForumChildren = await targetForum.extendChildrenForums();
    if(targetForumChildren.length > 0) {
      ctx.throw(400, '目标专业下存在下级专业');
    }
    let forumChildren = await forum.extendChildrenForums();
    if(forumChildren.length > 0) {
      ctx.throw(400, '当前专业下存在下级专业');
    }
    // 将被合并专业下的文章数加到目标专业下的文章数目
    let currentForumThreadsCount = await db.ThreadModel.find({mainForumsId:fid}).count(); // 专业下文章数
    let currentForumPostsCount = await db.PostModel.find({mainForumsId:fid}).count(); // 专业下评论数
    let currentPostsTodayCount = forum.countPostsToday;
    targetForum.countThreads += currentForumThreadsCount;
    targetForum.countPosts += currentForumPostsCount;
    targetForum.countPostsToday += currentPostsTodayCount;
    await targetForum.update({countPosts:targetForum.countPosts, countThreads:targetForum.countThreads, countPostsToday:targetForum.countPostsToday});
    await forum.update({countPosts:0, countThreads:0, countPostsToday:0})
    // 将当前专业转化为目标专业的分类
    // 1.如果目标专业下存在该分类，则将当前专业下文章自动划入该分类
    // 2.如果目标专业下不存在该分类，则在目标专业下新建分类，并将文章划入该分类
    let currentThreadType = await db.ThreadTypeModel.findOne({fid:targetForum.fid, name:forum.displayName});
    if(!currentThreadType) {
      const lastType = await db.ThreadTypeModel.findOne({fid: targetForum.fid}).sort({order: -1});
      let order = 1;
      if(lastType) {
        order = lastType.order + 1;
      }
      const cid = await db.SettingModel.operateSystemID('threadTypes', 1);
      currentThreadType = db.ThreadTypeModel({
        cid,
        name: forum.displayName,
        order,
        fid: targetForum.fid
      });
      await currentThreadType.save();
      await redis.cacheForums();
    }
    let newCategorysId = [currentThreadType.cid];
    // 找到当前专业下所有thread，并将parentsId中的fid修改为mergeForumId
    await db.ThreadModel.updateMany({mainForumsId:fid},{$set:{'mainForumsId.$': mergeForumId, 'categoriesId':newCategorysId}});
    // 找到当前专业下所有post，并将parentsId中的fid修改为mergeForumId
    await db.PostModel.updateMany({mainForumsId:fid},{$set:{'mainForumsId.$': mergeForumId, 'categoriesId':newCategorysId}});
		await next();
	});
module.exports = mergeRouter;
