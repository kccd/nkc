const Router = require('koa-router');
const router = new Router();
router
  .use('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.certList = await db.RoleModel.getCertList();
    await next();
  })
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    data.downloadSettings = await db.SettingModel.getSettings('download');
    ctx.template = 'experimental/settings/download/download.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, data, body, nkcModules} = ctx;
    const {downloadSettings} = body;
    const {speed, allSpeed} = downloadSettings;
    const {checkNumber} = nkcModules.checkData;
    const {certList} = data;
    const certListObj = {};
    for(const c of certList) {
      certListObj[c.type] = c;
    }
    checkNumber(allSpeed, {
      name: '总下载速度',
      min: 0,
    });
    const speedTypes = speed.others.map(o => o.type);
    if([...new Set(speedTypes)].length !== speedTypes.length) {
      ctx.throw(400, '类型重复，请检查');
    }
    const checkTimeSpeed = async (name, arr) => {
      let number = 0;
      for(const a of arr) {
        const {startingTime, endTime, speed} = a;
        checkNumber(startingTime, {
          name: '速度限制起始时间',
          min: 0,
          max: 24
        });
        checkNumber(endTime, {
          name: '速度限制结束时间',
          min: 0,
          max: 24
        });
        if(startingTime >= endTime) ctx.throw(400, `类型「${name}」速度限制中的起始时间必须小于结束时间`);
        checkNumber(speed, {
          name: '下载速度',
          min: 0
        });
        number += (endTime - startingTime);
      }
      if(number !== 24) {
        ctx.throw(400, `类型「${name}」速度限制中的时间范围设置错误`);
      }
    };

    for(const o of speed.others) {
      const cl = certListObj[o.type];
      if(!cl) ctx.throw(400, `type error. type: ${o.type}`);
      checkNumber(o.fileCount, {
        name: `类型「${cl.name}」每天附件下载上限`,
        min: 0,
      });
      await checkTimeSpeed(cl.name, o.data);
    }
    checkNumber(speed.default.fileCount, {
      name: `类型「其他」每天附件下载上限`,
      min: 0
    });
    await checkTimeSpeed('其他', speed.default.data);
    await db.SettingModel.updateOne({_id: 'download'}, {
      $set: {
        'c.speed': speed,
        'c.allSpeed': allSpeed
      }
    });
    await db.SettingModel.saveSettingsToRedis('download');
    await next();
  });
module.exports = router;
