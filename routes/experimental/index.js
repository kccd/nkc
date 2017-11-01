const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
let dbFn = nkcModules.dbFunction;
let apiFn = nkcModules.apiFunction;
const experimentalRouter = new Router();


experimentalRouter
  .get('/', async (ctx, next) => {
    let forumList = await dbFn.getAvailableForums(ctx);
    ctx.data.forumList = forumList;
    ctx.data.forumTree = forumList;
    ctx.template = 'interface_experimental.pug';
    await next();
  })
  .get('/newUsers', async (ctx, next) => {
    let {db} = ctx;
    let {user} = ctx.data;
    let page = parseInt(ctx.query.page);
    if(!page || page === 0) {
      page = 0;
    }else {
      page--;
    }
    let userLength = await db.UserModel.count();
    let paging = apiFn.paging(page, userLength);
    /*let userArr = await db.UserModel.aggregate([
      {$sort: {toc: -1}},
      {$skip: paging.start},
      {$limit: paging.perpage}
    ]);*/
    let userArr = await db.UserModel.find().sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    for (let i = 0; i < userArr.length; i++) {
      userArr[i] = userArr[i].toObject();
      let userPersonal = await db.UsersPersonalModel.findOne({uid: userArr[i].uid});
      if(userPersonal){
        userArr[i].regIP = userPersonal.regIP;
        userArr[i].regPort = userPersonal.regPort;
      }
    }
    paging.page++;
    ctx.data.page = paging;
    ctx.data.users = userArr;
    ctx.template = 'interface_new_users.pug';
    await next();
  })
  .get('/newSysinfo', async (ctx, next) => {
    ctx.template = 'interface_new_sysinfo.pug';
    await next();
  });
  // .use('/set', setRouter.routes(), setRouter.allowedMethods())
module.exports = experimentalRouter;