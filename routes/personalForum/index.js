const Router = require('koa-router');
const router = new Router();

router
  .get('/:uid', async () => {
    const {data, params, db, query} = ctx;
    const {uid} = params;
    const {PersonalForumModel} = db;
    const personalForum = PersonalForumModel.findOnly({uid});
    const threads = personalForum.getThreadsByQuery(query, {uid})

  })