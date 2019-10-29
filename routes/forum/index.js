const Router = require('koa-router');
const singleForumRouter = require('./singleForum');
const forumRouter = new Router();

forumRouter
  .get('/', async (ctx, next) => {
    const {data, db, nkcModules} = ctx;
    const {user} = data;
    const threadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
		let forums = await db.ForumModel.visibleForums(data.userRoles, data.userGrade, data.user);
		let disciplineForums = await db.ForumModel.visibleForums(data.userRoles, data.userGrade, data.user, 'discipline');
		let topicForums = await db.ForumModel.visibleForums(data.userRoles, data.userGrade, data.user, 'topic');
		forums = nkcModules.dbFunction.forumsListSort(forums, threadTypes);
		disciplineForums = nkcModules.dbFunction.forumsListSort(disciplineForums, threadTypes);
		topicForums = nkcModules.dbFunction.forumsListSort(topicForums, threadTypes);
		data.forums = forums.map(forum => {
      if(forum.toObject) {
        forum.toObject();
      }
      return forum;
    });
		data.disciplineForums = disciplineForums.map(discipline => {
      if(discipline.toObject) {
        discipline.toObject();
      }
      return discipline;
    });
		data.topicForums = topicForums.map(topic => {
      if(topic.toObject) {
        topic.toObject();
      }
      return topic;
    });
		data.forumsJson = nkcModules.apiFunction.forumsToJson(data.forums);
		data.disciplineJSON = nkcModules.apiFunction.disciplineToJSON(data.forums);
		data.topicJSON = nkcModules.apiFunction.topicToJSON(data.forums);
    ctx.template = 'interface_forums.pug';
    data.uid = user? user.uid: undefined;
		// data.navbar = {highlight: 'forums'};
    await next();
  })
	.post('/', async (ctx, next) => {
		const {data, redis, db, body} = ctx;
		const {displayName, forumType} = body;
		if(!displayName) ctx.throw(400, '名称不能为空');
		const sameDisplayNameForum = await db.ForumModel.findOne({displayName});
		if(sameDisplayNameForum) ctx.throw(400, '名称已存在');
		let _id;
		while(1) {
			_id = await db.SettingModel.operateSystemID('forums', 1);
			const sameIdForum = await db.ForumModel.findOne({fid: _id});
			if(!sameIdForum) {
				break;
			}
		}
		const newForum = db.ForumModel({
			fid: _id,
			displayName,
			accessible: false,
			visibility: false,
			type: 'forum'
    });

    await newForum.save();

    await newForum.createLibrary(data.user.uid);
    
    await redis.cacheForums();
		data.forum = newForum;
		await next();
	})
  .use('/:fid', singleForumRouter.routes(), singleForumRouter.allowedMethods());
module.exports = forumRouter;