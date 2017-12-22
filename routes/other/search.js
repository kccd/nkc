const Router = require('koa-router');

const router = new Router();

router.get('/', async(ctx, next) => {
  ctx.template = 'interface_localSearch.pug';
  const {
    data,
    es,
    settings,
    query,
  } = ctx;
  const {q, type = 'content', page = 0} = query;
  const {perpage} = settings.paging;
  const {searchPost, searchUser} = es;
  data.type = type;
  data.q = q;
  data.page = page;
  const nowAt = page * perpage;
  if(type === 'content') {
    data.result = await searchPost('光标', nowAt, perpage);
    console.log(data.result.hits.hits.map(usr => usr.highlight));
    return next()
  } else if(type === 'user') {
    data.result = await searchUser('lzszone', nowAt, perpage);
    return next()
  }
  ctx.throw(404, 'unknown type..')
});

module.exports = router;