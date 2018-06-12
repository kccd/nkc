const Router = require('koa-router');
const router = new Router();
router
  .get('/', async(ctx, next) => {
    const {data, db, query} = ctx;
    const {searchType} = query;
    let queryMap;
    data.searchType = searchType;
    if(searchType === "password"){
      queryMap = {"operation":"changePassword"}
    }
    if(searchType === "email"){
      queryMap = {"operationId":{"$in":["bindEmail", "changeEmail"]}}
    }
    if(searchType === "mobile"){
      queryMap = {"operationId":{"$in":["bindMobile", "modifyMobile"]}}
    }
    if(searchType === "userame"){
      queryMap = {"operationId":"modifyUsername"}
    }
    data.result = await db.SecretBehaviorModel.find(queryMap)
    ctx.template = 'experimental/log/secret.pug';
    await next()
  })
module.exports = router;