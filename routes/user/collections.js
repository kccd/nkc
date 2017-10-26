const Router = require('koa-router');
const collectionsRouter = new Router();
const nkcModules = require('../../nkcModules');
let dbFn = nkcModules.dbFunction;

collectionsRouter
  .get('/:category', async (ctx, next) => {
    let db = ctx.db;
    let user = ctx.data.user;
    let targetUserUid = ctx.params.uid;
    let category = (ctx.params.category === 'null')? '': ctx.params.category;
    let targetUser = {};
    if(user.uid !== targetUserUid) {
      targetUser = await db.UserModel.findOne({uid: targetUserUid});
    }else {
      targetUser = user;
    }
    ctx.data.categoryName = await db.CollectionModel.find({uid: targetUserUid}).distinct('category');
    let queryDate = {
      uid: targetUserUid,
      category: category
    };
    let categoryThreads = await dbFn.foundCollection(queryDate);
    ctx.template = 'interface_collections.pug';
    await next();
  });

module.exports = collectionsRouter;