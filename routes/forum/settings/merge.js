const Router = require('koa-router');
const mergeRouter = new Router();
mergeRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'forum/settings/merge.pug';
		await next();
	})
  .put('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {targetForumId} = body;
    const {forum} = data;
    if(forum.fid === targetForumId) {
      ctx.throw(400, `当前专业不能与目标专业相同`);
    }
    const targetForum = await db.ForumModel.findOne({fid: targetForumId});
    const targetForumChildren = await targetForum.extendChildrenForums();
    const forumChildren = await forum.extendChildrenForums();
    if(targetForumChildren.length || forumChildren.length) {
      ctx.throw(400, `待合并的两个专业均不能包含子专业`);
    }

    let currentThreadType = await db.ThreadTypeModel.findOne({fid: targetForum.fid, name: forum.displayName});
    if(!currentThreadType) {
      const lastType = await db.ThreadTypeModel.findOne({fid: targetForum.fid}).sort({order: -1});
      const order = lastType? lastType.order + 1: 1;
      const cid = await db.SettingModel.operateSystemID('threadTypes', 1);
      currentThreadType = db.ThreadTypeModel({
        cid,
        name: forum.displayName,
        order,
        fid: targetForum.fid
      });
      await currentThreadType.save();
    }
    const forumThreadTypes = await db.ThreadTypeModel.find({fid: forum.fid}, {cid: 1});
    const forumThreadTypesId = forumThreadTypes.map(f => f.cid);
    // 添加目标专业的ID和文章分类
    await db.ThreadModel.updateMany({mainForumsId: forum.fid}, {
      $addToSet: {
        mainForumsId: targetForum.fid,
        categoriesId: currentThreadType.cid,
      }
    });
    await db.PostModel.updateMany({mainForumsId: forum.fid}, {
      $addToSet: {
        mainForumsId: targetForum.fid,
        categoriesId: currentThreadType.cid,
      }
    });
    // 去掉当前专业的ID和文章分类
    await db.ThreadModel.updateMany({mainForumsId: forum.fid}, {
      $pullAll: {
        mainForumsId: [forum.fid],
        categoriesId: forumThreadTypesId,
      }
    });
    await db.PostModel.updateMany({mainForumsId: forum.fid}, {
      $pullAll: {
        mainForumsId: [forum.fid],
        categoriesId: forumThreadTypesId,
      }
    });
    await forum.updateForumMessage();
    await targetForum.updateForumMessage();
    await next();
  });
module.exports = mergeRouter;
