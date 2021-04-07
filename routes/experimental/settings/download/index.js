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
    const {speed, allSpeed, fileCountLimit, freeTime} = downloadSettings;
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
          name: `类型「${name}」速度限制起始时间`,
          min: 0,
          max: 24
        });
        checkNumber(endTime, {
          name: `类型「${name}」速度限制结束时间`,
          min: 0,
          max: 24
        });
        // if(startingTime >= endTime) ctx.throw(400, `类型「${name}」速度限制中的起始时间必须小于结束时间`);
        checkNumber(speed, {
          name: `类型「${name}」下载速度`,
          min: 0
        });
        /*checkNumber(fileCount, {
          name: `类型「${name}」${startingTime}点到${endTime}点附件下载数量`,
          min: 0,
        });*/
        if(endTime > startingTime) {
          number += (endTime - startingTime);
        } else {
          number += (24 - startingTime + endTime);
        }
      }
      if(number !== 24) {
        ctx.throw(400, `类型「${name}」速度限制中的时间范围设置错误`);
      }
    };

    const checkFileCount = async (name, arr) => {
      let number = 0;
      for(const a of arr) {
        const {startingTime, endTime, fileCount} = a;
        checkNumber(startingTime, {
          name: `类型「${name}」附件个数限制起始时间`,
          min: 0,
          max: 24
        });
        checkNumber(endTime, {
          name: `类型「${name}」附件个数限制结束时间`,
          min: 0,
          max: 24
        });
        // if(startingTime >= endTime) ctx.throw(400, `类型「${name}」附件个数限制中的起始时间必须小于结束时间`);
        checkNumber(fileCount, {
          name: `类型「${name}」${startingTime}点到${endTime}点附件最大下载数量`,
          min: 0,
        });
        if(endTime > startingTime) {
          number += (endTime - startingTime);
        } else {
          number += (24 - startingTime + endTime);
        }
      }
      if(number !== 24) {
        ctx.throw(400, `类型「${name}」附件个数限制中的时间范围设置错误`);
      }
    };

    for(const o of speed.others) {
      const cl = certListObj[o.type];
      if(!cl) ctx.throw(400, `type error. type: ${o.type}`);
      await checkTimeSpeed(cl.name, o.data);
    }
    await checkTimeSpeed('其他', speed.default.data);

    // 验证下载文件数量限制
    for(const f of fileCountLimit.others) {
      const cl = certListObj[f.type];
      if(!cl) ctx.throw(400, `type error. type: ${f.type}`);
      await checkFileCount(cl.name, f.data);
    }
    await checkFileCount('其他', fileCountLimit.default.data);

    // 验证特殊证书下载文件数量限制
    let rolesType = new Set();
    for(const r of fileCountLimit.roles) {
      const {type, fileCount} = r;
      rolesType.add(type);
      const cl = certListObj[type];
      if(!cl) ctx.throw(400, `type error. type: ${type}`);
      checkNumber(fileCount, {
        name: `证书「${cl.name}」附件个数限制`,
        min: 0
      });
    }
    if(rolesType.size !== fileCountLimit.roles.length) ctx.throw(400, `证书附件个数限制类型重复`);

    checkNumber(freeTime, {
      name: '免费重复下载附件的最大时间',
      min: 0,
      fractionDigits: 2,
    });

    await db.SettingModel.updateOne({_id: 'download'}, {
      $set: {
        'c.speed': speed,
        'c.allSpeed': allSpeed,
        'c.fileCountLimit': fileCountLimit,
        'c.freeTime': freeTime
      }
    });
    await db.SettingModel.saveSettingsToRedis('download');
    await next();
  });
module.exports = router;
