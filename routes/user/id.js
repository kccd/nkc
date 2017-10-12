const Router = require('koa-router');
const {userModel} = require('../../dataModels');
const {render} = require('../../nkcModules');
const idRouter = new Router();
idRouter
  .get('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    const user = await userModel.find({uid});
    const data = {user};
    ctx.body = render('./pages/user.pug', {data});
    next()
  });
module.exports = idRouter;