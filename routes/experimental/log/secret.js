const Router = require('koa-router');
const router = new Router();
router
  .get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page=0, type} = query;
    let queryMap;
    data.type = type;
    if(type === "password"){
      queryMap = {"operationId":"modifyPassword"}
    }
    if(!type || type === "email"){
      queryMap = {"operationId":{"$in":["bindEmail", "changeEmail"]}}
    }
    if(type === "mobile"){
      queryMap = {"operationId":{"$in":["bindMobile", "modifyMobile"]}}
    }
    if(type === "username"){
      queryMap = {"operationId":"modifyUsername"}
    }
    const count = await db.SecretBehaviorModel.count(queryMap);
		const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging
    const secretBehaviors = await db.SecretBehaviorModel.find(queryMap).sort({toc:-1}).skip(paging.start).limit(paging.perpage);
    data.result = await Promise.all(secretBehaviors.map(async behavior => {
			await behavior.extendUser();
			return behavior;
		}));
    ctx.template = 'experimental/log/secret.pug';
    await next()
  })
module.exports = router;