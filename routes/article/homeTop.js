const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');

const router = require('koa-router')();

router
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
    //独立文章首页置顶
    const { db, data, params } = ctx;
    const { aid } = params;
    const { valueName } = data;
    const obj = {};
    const homeSettings = await db.SettingModel.getSettings('home');
    const articles = homeSettings[valueName];
    const { included, index } = await db.SettingModel.isIncludesOfArr(
      articles,
      'id',
      aid,
    );
    if (included) {
      articles.splice(index, 1);
    }
    articles.unshift({
      type: 'article',
      id: aid,
    });
    obj[`c.${valueName}`] = articles;
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
    //独立文章首页取消置顶
    const { db, data, params } = ctx;
    const { aid } = params;
    const { valueName } = data;
    const obj = {};
    obj[`c.${valueName}`] = {
      type: 'article',
      id: aid,
    };
    //去除设置中的id
    await db.SettingModel.updateOne(
      { _id: 'home' },
      {
        $pull: obj,
      },
    );
    await db.SettingModel.saveSettingsToRedis('home');
    await next();
  });

module.exports = router;
