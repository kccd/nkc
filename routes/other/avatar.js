const Router = require('koa-router');
const router = new Router();
const {accessSync} = require('fs');

console.log('aaaa')

router
  .get('/', async (ctx, next) => {
    ctx.throw(501, 'a uid is required.');
    await next()
  })
  .get('/:uid', async (ctx, next) => {
    const {uid} = ctx.params;
    console.log(ctx.request.type);
    ctx.request.type = 'image/*';
    console.log(ctx.request.type);
    try {
      const path = `../../resources/avatar/${uid}`;
      accessSync(path);
      ctx.filePath = path;
    } catch(e) {
      ctx.filePath = '../../resources/default/default_avatar_small.gif'
    }
    await next()
  });

module.exports = router;