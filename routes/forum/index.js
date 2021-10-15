const Router = require('koa-router');
const singleForumRouter = require('./singleForum');
const forumRouter = new Router();

forumRouter
  .get('/', async (ctx, next) => {
    const {data, query, db, nkcModules} = ctx;
    const {user} = data;
    const {t = 'map', f = 'writable'} = query;
		data.forumCategories = await db.ForumCategoryModel.getCategories();
		if(t === 'selector') {
			if(!['writable', 'readable'].includes(f)) ctx.throw(400, `专业类型错误 from: ${f}`);
			data.forums = await db.ForumModel.getForumSelectorForums(user? user.uid: '', f);
			data.subscribeForumsId = [];
			if(user) {
				data.subscribeForumsId = await db.SubscribeModel.getUserSubForumsId(user.uid);
			}
		} else {
			let subFid = [];
			if(user) {
				subFid = await db.SubscribeModel.getUserSubForumsId(user.uid);
			}
			const threadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
			const forumsOrigin = await db.ForumModel.visibleForums(data.userRoles, data.userGrade, data.user);
			/*const readableForumsId = await db.ForumModel.getReadableForumsIdByUid(data.user? data.user.uid: '');
      let visibilityForumsId = await db.ForumModel.getVisibilityForumsIdFromRedis();
      visibilityForumsId = visibilityForumsId.filter(fid => readableForumsId.includes(fid));
      const forumsOrigin = await db.ForumModel.find({fid: {$in: visibilityForumsId}}).sort({order: 1});*/
			data.recommendForums = await db.ForumModel.getRecommendForums(forumsOrigin.map(f => f.fid));
			data.recommendForums = data.recommendForums.slice(0, 4);
			const forumsObj = {}, forums = [];
			let parentsId = [];
			for(const f of forumsOrigin) {
				const forum = f.toObject();
				parentsId = parentsId.concat(forum.parentsId);
				forum.subscribed = subFid.includes(forum.fid);
				forumsObj[forum.fid] = forum;
				forums.push(forum);
			}

			forums.map(f => {
				f.canSubscribe = !parentsId.includes(f.fid);
			});

			data.forums = nkcModules.dbFunction.forumsListSort(forums, threadTypes);


			data.disciplineForums = [];
			data.topicForums = [];
			data.forums.map(f => {
				f.canSubscribe = !parentsId.includes(f.fid);
				if(f.forumType === "topic") {
					data.topicForums.push(f);
				} else {
					data.disciplineForums.push(f);
				}
			});

			data.recycleId = await db.SettingModel.getRecycleId();

			if(user) {
				const subForums = [], visitedForums = [];
				for(const fid of subFid) {
					const f = forumsObj[fid];
					if(!f) continue;
					const cloneForum = Object.assign({}, f);
					cloneForum.childrenForums = [];
					subForums.push(f);
				}
				const visitedForumsId = user.generalSettings.visitedForumsId.slice(0, 5);
				for(const fid of visitedForumsId) {
					const f = forumsObj[fid];
					if(!f) continue;
					const cloneForum = Object.assign({}, f);
					cloneForum.childrenForums = [];
					visitedForums.push(cloneForum);
				}
				data.subForums = subForums;
				data.visitedForums = visitedForums;
			}
			ctx.template = "forums/forums.pug";
			data.uid = user? user.uid: undefined;
		}
    await next();
  })
	.post('/', async (ctx, next) => {
		const {data, db, redis, body} = ctx;
		const {displayName, type} = body;
		const newForum = await db.ForumModel.createForum(displayName, type);
		await redis.cacheForums();
 		await db.ForumModel.saveForumToRedis(newForum.fid);
		data.forum = newForum;
		data.forums = await db.ForumModel.find({parentsId: []}).sort({order: 1});
		await next();
	})
  .use('/:fid', singleForumRouter.routes(), singleForumRouter.allowedMethods());
module.exports = forumRouter;
