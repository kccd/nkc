const Router = require('koa-router');
const router = new Router();
router
  .get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page=0, type, content} = query;
    data.content = content;
    let queryMap = {};
    if(content) {
      queryMap = {
        code: content
      }
    }
    const count = await db.ShareLogsModel.count(queryMap);
    const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    const shareLogs = await db.ShareLogsModel.find(queryMap).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		data.type = 'shareLogs';
    data.result = await Promise.all(shareLogs.map(async log => {
      await log.extendUser();
			return log;
		}));
    ctx.template = 'experimental/log/share.pug';
    await next()
  })
module.exports = router;