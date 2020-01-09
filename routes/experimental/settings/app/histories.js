const Router = require('koa-router');

const historiesRouter = new Router();

historiesRouter
  .get('/', async (ctx, next) => {
    const { nkcModules, data, db, query } = ctx;
    const { page = 0, os = 'android' } = query;
    data.type = 'histories';
    data.os = os;
    const count = await db.AppVersionModel.count({ appPlatForm: os });
    const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    data.histories = await db.AppVersionModel.find({ appPlatForm: os }).sort({ toc: -1 }).skip(paging.start).limit(paging.perpage);
    ctx.template = 'experimental/settings/app.pug';
    await next();
  })
  .patch('/', async (ctx, next) => {
    const { nkcModules, db, body } = ctx;
    const { newVersion, operating } = body;
    const { checkString } = nkcModules.checkData;
    checkString(newVersion.appVersion, {
      name: '版本号',
      minLength: 1,
      maxLength: 20
    });
    checkString(newVersion.appDescription, {
      name: '更新内容',
      minLength: 1,
      maxLength: 2000
    });
    // 修改下载状态
    if (operating === 'changeState') {
      await db.AppVersionModel.updateOne({ hash: newVersion.hash }, {
        $set: {
          canDown: newVersion.canDown
        }
      });
    };
    // 设置稳定版本
    if (operating === 'setStable') {
      await db.AppVersionModel.update({ stable: true }, {
        $set: {
          stable: false
        }
      });
      await db.AppVersionModel.updateOne({ hash: newVersion.hash }, {
        $set: {
          stable: true
        }
      });
    };
    // 修改版本号和描述
    if (operating === 'updateVersion') {
      const repeatVersionCount = await db.AppVersionModel.count({ appVersion: newVersion.appVersion, hash: { $ne: newVersion.hash } });
      if (repeatVersionCount) {
        ctx.throw(400, "版本号已存在！");
      }
      await db.AppVersionModel.updateOne({ hash: newVersion.hash }, {
        $set: {
          appVersion: newVersion.appVersion,
          appDescription: newVersion.appDescription
        }
      });
    }
    ctx.state = 200;
    await next();
  })

module.exports = historiesRouter;