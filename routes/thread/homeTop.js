const Router = require('koa-router');
const homeTopRouter = new Router();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
homeTopRouter
  .use('/', OnlyOperation(Operations.homeTop), async (ctx, next) => {
    const { body, query, data } = ctx;
    const type = body.type || query.type;
    if (type === 'latest') {
      data.valueName = 'latestToppedThreadsId';
    } else if (type === 'community') {
      data.valueName = 'communityToppedThreadsId';
    } else {
      data.valueName = 'toppedThreadsId';
    }
    await next();
  })
  .post('/', OnlyOperation(Operations.homeTop), async (ctx, next) => {
    //文章首页顶置
    const { params, db, data } = ctx;
    const { tid } = params;
    const { valueName } = data;
    const obj = {};
    const homeSettings = await db.SettingModel.getSettings('home');
    const threads = homeSettings[valueName];
    //获取id是否存在对象数组中
    const { included, index } = await db.SettingModel.isIncludesOfArr(
      threads,
      'id',
      tid,
    );
    //如果存在就删除该索引
    if (included) {
      threads.splice(index, 1);
    }
    threads.unshift({
      type: 'thread',
      id: tid,
    });
    obj[`c.${valueName}`] = threads;
    await db.SettingModel.updateOne(
      { _id: 'home' },
      {
        $set: obj,
      },
    );
    await db.SettingModel.saveSettingsToRedis('home');
    await next();
  })
  .del('/', OnlyOperation(Operations.homeTop), async (ctx, next) => {
    //取消文章首页顶置
    const { params, db, data } = ctx;
    const { tid } = params;
    const { valueName } = data;
    const obj = {};
    obj[`c.${valueName}`] = {
      type: 'thread',
      id: tid,
    };
    await db.SettingModel.updateOne(
      { _id: 'home' },
      {
        $pull: obj,
      },
    );
    await db.SettingModel.saveSettingsToRedis('home');
    await next();
  });
module.exports = homeTopRouter;
