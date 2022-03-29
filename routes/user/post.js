const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db, params} = ctx;
    ctx.template = 'vueRoot/index.pug';
    return next();
  });
module.exports = router;
