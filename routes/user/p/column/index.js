const Router = require("koa-router");
const router = new Router();
router
  .get('/', async (ctx, next) => {
    //获取用户在专栏下发表的文章
    const {data, db, state, params} = ctx;
    const {user} = data;
    const {uid} = state;
    //获取
    await next();
  })
