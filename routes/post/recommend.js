const Router = require('koa-router');
const router = new Router();

router
  .post('/', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const {user} = data;
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await targetPost.extendThread();
    await targetThread.extendForum();
    const gradeId = data.userGrade._id;
    const rolesId = data.userRoles.map(r => r._id);
    const options = {
    	gradeId,
	    rolesId,
	    uid: data.user?data.user.uid: ''
    };
    await targetThread.ensurePermission(options);
    if(targetPost.disabled) ctx.throw(400, '无法推荐已经被禁用的回复');
    const personal = await db.PersonalForumModel.findOneAndUpdate({uid: user.uid}, {$addToSet: {recPosts: pid}});
    const post = await db.PostModel.findOneAndUpdate({pid}, {$addToSet: {recUsers: user.uid}});
    if(personal.recPosts.includes(pid) && post.recUsers.includes(user.uid))
      ctx.throw(400, '您已经推介过该post了,没有必要重复推介');
    data.targetUser = await post.extendUser();
    data.message = post.recUsers.length + 1;
    // 被点赞用户的被点赞数加一并且生成记录
	  await db.UsersScoreLogModel.insertLog({
			user: data.targetUser,
		  type: 'score',
		  typeIdOfScoreChange: 'liked',
		  key: 'recCount',
		  ip: ctx.address,
		  port: ctx.port,
		  pid,
		  tid: targetThread.tid,
		  fid: targetThread.fid
	  });
	  await db.UsersScoreLogModel.insertLog({
			user:data.targetUser,
		  type: 'kcb',
		  typeIdOfScoreChange: 'liked',
		  ip: ctx.address,
		  port: ctx.port,
		  pid,
		  tid: targetThread.tid,
		  fid: targetThread.fid
	  });
    await next();
  })
  .del('/', async (ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const {user} = data;
    const personal = await db.PersonalForumModel.findOneAndUpdate({uid: user.uid}, {$pull: {recPosts: pid}});
    const post = await db.PostModel.findOneAndUpdate({pid}, {$pull: {recUsers: user.uid}});
    const targetThread = await db.ThreadModel.findOnly({tid: post.tid});
    if(!personal.recPosts.includes(pid) && !post.recUsers.includes(user.uid))
      ctx.throw(400, '您没有推介过该post了,没有必要取消推介');
    data.message = (post.recUsers.length > 0)?post.recUsers.length - 1: 0;
    data.targetUser = await post.extendUser();
	  await db.UsersScoreLogModel.insertLog({
		  user: data.targetUser,
		  type: 'score',
		  typeIdOfScoreChange: 'unLiked',
		  change: -1,
		  key: 'recCount',
		  ip: ctx.address,
		  port: ctx.port,
		  pid,
		  tid: targetThread.tid,
		  fid: targetThread.fid
	  });
	  await db.UsersScoreLogModel.insertLog({
		  user:data.targetUser,
		  type: 'kcb',
		  typeIdOfScoreChange: 'unLiked',
		  ip: ctx.address,
		  port: ctx.port,
		  pid,
		  tid: targetThread.tid,
		  fid: targetThread.fid
	  });
	  await next();
  });

module.exports = router;