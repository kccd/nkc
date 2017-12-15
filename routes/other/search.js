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
  const nowAt = page * perpage;
  if(type === 'content') {
    data.result = await searchPost('lzszone', nowAt, perpage);
    console.log(data.result);
    return next()
  }
  data.result = await searchUser('lzszone', nowAt, perpage);
  return next()
});

module.exports = router;