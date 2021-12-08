const router = require('koa-router')();
const teamsRouter = require('./teams');
router
  .get('/', async (ctx, next) => {
    ctx.template = 'pim/index.pug';
    await next();
  })
  .use('/teams', teamsRouter.routes(), teamsRouter.allowedMethods());
module.exports = router;