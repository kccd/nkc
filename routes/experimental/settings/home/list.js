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
    const {topic, discipline, visitorThreadList, hotThreads, recommend} = body;
    if(!["recommend", "latest"].includes(visitorThreadList)) ctx.throw(400, `参数visitorThreadList错误：${visitorThreadList}`);
    const {postCount, postUserCount} = hotThreads;
    if(postCount < 0) ctx.throw(400, "热门文章最小回复数不能小于0");
    if(postUserCount < 0) ctx.throw(400, "热门文章最小回复用户总数不能小于0");
    if(recommend.voteUpTotal < 0) ctx.throw(400, "推荐条件中的点赞总数不能小于0");
    if(recommend.voteUpMax < 0) ctx.throw(400, "推荐条件中的独立点赞数不能小于0");
    if(recommend.encourageTotal < 0) ctx.throw(400, "推荐条件中的鼓励总数不能小于0");
    await db.SettingModel.update({_id: 'home'}, {
      $set: {
        'c.list.topic': !!topic,
        'c.list.discipline': !!discipline,
        'c.visitorThreadList': visitorThreadList,
        'c.hotThreads': hotThreads,
        'c.recommend': recommend
      }
    });
    await next();
  });
module.exports = router;