const Router = require('koa-router');
const router = new Router();
const rollback = require('./rollback');

router
  .get('/', async(ctx, next) => {
    const {pid} = ctx.params;
    const {db, data} = ctx;
    const {nkcRender} = ctx.nkcModules;
    const targetPost = await db.PostModel.findOnly({pid});
    const targetThread = await db.ThreadModel.findOnly({tid: targetPost.tid});
    await targetThread.extendForums(['mainForums', 'minorForums']);
    await targetThread.ensurePermission(data.userRoles, data.userGrade, data.user);
    if(targetPost.hideHistories && !data.userOperationsId.includes('displayPostHideHistories')) ctx.throw(403,'权限不足');
    data.post = targetPost;
    data.histories = [];
    const histories = await db.HistoriesModel.find({pid}).sort({tlm: 1});
    const usersId = [];
    histories.map(h => usersId.push(h.uidlm));
    const users = await db.UserModel.find({uid: {$in: usersId}});
    const usersObj = {};
    users.map(user => usersObj[user.uid] = user);
    const resources = await db.ResourceModel.getResourcesByReference(data.post.pid);
    for(let i = 0; i < histories.length; i++) {
      const h = histories[i].toObject();
      h.c = nkcRender.HTMLToPlain(h.c);
      if(targetPost.anonymous) {
        h.uid = "";
        h.uidlm = "";
      } else {
        h.targetUser = usersObj[h.uidlm];
      }
      h.version = i + 1;
      data.histories.push(h);
    }
    if(targetPost.anonymous) {
      data.post.uid = "";
      data.post.uidlm = "";
    } else {
      data.targetUser = await targetPost.extendUser();
    }
    data.histories.reverse();
    ctx.template = 'post/history.pug';
    await next();
  })
	.patch('/', async (ctx, next) => {
		const {body, db, params, data} = ctx;
		// if(data.userLevel < 6) ctx.throw(403, '权限不足');
		const {pid} = params;
		const {operation} = body;
		const targetPost = await db.PostModel.findOnly({pid});
		if(operation === 'disableHistories') {
			await targetPost.update({hideHistories: true});
		} else if(operation === 'unDisableHistories') {
			await targetPost.update({hideHistories: false});
		}
		await next();
	})
  .use('/rollback', rollback.routes(), rollback.allowedMethods());

module.exports = router;