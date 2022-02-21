const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {query, state, db} = ctx;
    const {page = 0} = query;
    const match = {
      uid: state.uid,
      source: 'column',
      published: true,
      deleted: false,
    };
    await next();
  })
module.exports = router;