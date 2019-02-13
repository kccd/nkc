const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    data.homeSettings = (await db.SettingModel.findOnly({_id: 'home'})).c;
    ctx.template = 'experimental/settings/home.pug';
    data.type = 'list';
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {db, body} = ctx;
    const {topic, discipline} = body;
    await db.SettingModel.update({_id: 'home'}, {$set: {
      'c.list.topic': !!topic,
      'c.list.discipline': !!discipline
    }})
    await next();
  });
module.exports = router;