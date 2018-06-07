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
    if(!(await targetThread.ensurePermission(ctx)))
      ctx.throw(403, '权限不足');
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
    return ctx.redirect(`/t/${originPost.tid}?&pid=${pid}`);
  });

module.exports = router;