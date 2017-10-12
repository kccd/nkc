const Router = require('koa-router');
const {userModel} = require('../../dataModels');
const {render} = require('../../nkcModules');
const idRouter = require('./id');
const userRouter = new Router();


userRouter
  .get('/', async (ctx, next) => {
  const users = await userModel.find({}).sort({toc: -1}).limit(10);
  const data = {users};
  ctx.body = render('./pages/users.pug', {data});
  next();
})
  .post('/', async (ctx, next) => {
    ctx.body = JSON.stringify(ctx.query) + JSON.stringify(ctx.request.body);
    next()
  })
  .use('/:uid', idRouter.routes(), idRouter.allowedMethods());

module.exports = userRouter;