const Router = require('koa-router');
const operationRouter = require('./operation');
const threadRouter = new Router();

threadRouter
  .post('/:tid', async (ctx, next) => {
    const tid = ctx.params.tid;
    await next();
  })
  .get('/:tid', async (ctx, next) => {
    const {data, params, db, query} = ctx;
    const {tid} = params;
    const {ThreadModel, PersonalForumModel} = db;
    ctx.template = 'interface_thread.pug';
    const thread = await ThreadModel.findOne({tid});
    const {mid, toMid} = thread;
    data.posts = await thread.getPostsByQuery(query);
    data.thread = thread;
    console.log(mid, toMid);
    if(mid !== '')
      data.myForum = await PersonalForumModel.findOne({uid: mid});
    if(toMid !== '')
      data.OthersForum = await PersonalForumModel.findOne({uid: toMid});
    await next();
  })
  .use('/:tid', operationRouter.routes(), operationRouter.allowedMethods());
module.exports = threadRouter;