const Router = require('koa-router');
const router = new Router();

router
  .get('/:_id', async (ctx, next) => {
    const {pid, _id} = ctx.params;
    const {db, data, address, port} = ctx;
    const {user} = data;

    const {PostModel, HistoriesModel, ThreadModel} = db;
    const originPost = await PostModel.findOnly({pid});
    let targetPost = await HistoriesModel.findOnly({_id});
    const targetThread = await ThreadModel.findOnly({tid: targetPost.tid});
    await targetThread.extendForums(['mainForums', 'minorForums']);
	  await targetThread.ensurePermission(data.userRoles, data.userGrade, data.user);
    const _copy = Object.assign({}, originPost.toObject());
    _copy._id = undefined;
    const history = new HistoriesModel(_copy);
    await history.save();
    const {t, c, l} = targetPost;
    originPost.t = t;
    originPost.c = c;
    originPost.l = l;
    originPost.uidlm = user.uid;
    originPost.iplm = address;
    originPost.tlm = Date.now();
    await originPost.save();
    const q = {
			pid
    };
    if(!data.userOperationsId.includes('displayDisabledPosts')) {
    	q.disabled = false;
    }
    const {page} = await targetThread.getStep(q);
    return ctx.redirect(`/t/${originPost.tid}?page=${page}&highlight=${pid}#${pid}`);
  });

module.exports = router;