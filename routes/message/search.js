const Router = require('koa-router');
const router = new Router();

router
  .get('/', async (ctx, next) => {
    // 根据前端传来的参数uid和username判断
    // 若存在uid则通过uid查找精准匹配的用户
    // 若存在username则通过username用正则查找匹配的用户
    // 两者皆存在时将通过uid查找的用户放到最前面（一个或不存在），将通过username查找的用户分页返回
    const {nkcModules, data, db, query} = ctx;
    let {uid, username, page = 0} = query;
    if(!uid && !username) ctx.throw(400, 'uid or username is required');
    let users = [];
    console.log(page, typeof page)
    if(uid && page === 0) {
      uid = uid.trim();
      const u = await db.UserModel.find({uid});
      console.log(u);
      users = users.concat(u);
    }
    if(username) {
      username = uid.trim();
      username = username.toLowerCase();
      const q = {
        usernameLowerCase: new RegExp(username.toLowerCase(), 'i')
      };
      const count = await db.UserModel.count(q);
      const paging = nkcModules.apiFunction.paging(page, count);
      const u = await db.UserModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
      users = users.concat(u);
      data.paging = paging;
    }
    data.users = users;
    await next();
  });

module.exports = router;