const Router = require('koa-router');
const router = new Router();
router
  .get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    ctx.template = 'experimental/log/behavior.pug';
    const {page = 0, t = "", c = ""} = query;
    data.c = c;
    data.t = t;
    const q = {};
    let uid = "";
    if(t === "username") {
      const targetUser = await db.UserModel.findOne({usernameLowerCase: c.toLowerCase()});
      if(!targetUser) {
        data.results = [];
        return await next();
      } else {
        uid = targetUser.uid;
      }
    } else if(t === "uid") {
      uid = c;
    } else if(t === "ip") {
      q.ip = c;
    }
    if(uid) {
      q.uid = uid;
    }
    const count = await db.UsersBehaviorModel.countDocuments(q);
		const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    const logs = await db.UsersBehaviorModel.find(q).sort({timeStamp:-1}).skip(paging.start).limit(paging.perpage);
    data.results = await Promise.all(logs.map(async behavior => {
      await behavior.extendUser();
			return behavior;
		}));
    await next()
  });
module.exports = router;
