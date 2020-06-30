const router = require("koa-router")();
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const uploadSettings = await db.SettingModel.getSettings('upload');
    data.certList = await db.RoleModel.getCertList(['visitor']);
    uploadSettings.countLimit.others = await db.RoleModel.filterSettings(uploadSettings.countLimit.others, ['visitor']);
    uploadSettings.extensionLimit.others = await db.RoleModel.filterSettings(uploadSettings.extensionLimit.others, ['visitor']);
    data.uploadSettings = uploadSettings;
    ctx.template = "experimental/settings/upload/upload.pug";
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {db, body, nkcModules} = ctx;
    const {fields, files} = body;
    const {checkNumber} = nkcModules.checkData;
    const uploadSettings = JSON.parse(fields.uploadSettings);
    let {watermark, sizeLimit, countLimit, extensionLimit} = uploadSettings;
    watermark.enabled = !!watermark.enabled;
    if(watermark.transparency < 0) watermark.transparency = 0;
    if(watermark.transparency > 100) watermark.transparency = 100;
    countLimit.others = await db.RoleModel.filterSettings(countLimit.others, ['visitor']);
    extensionLimit.others = await db.RoleModel.filterSettings(extensionLimit.others, ['visitor']);
    // 水印尺寸限制
    checkNumber(watermark.minHeight, {
      name: '水印尺寸限制最小高度',
      min: 0
    });
    checkNumber(watermark.minWidth, {
      name: '水印尺寸限制最小宽度',
      min: 0
    });
    checkNumber(watermark.buyNoWatermark, {
      name: '开启去水印功能需花费积分',
      min: 0
    });
    // 尺寸限制
    checkNumber(sizeLimit.default, {
      name: '文件尺寸',
      min: 0,
    });
    for(const s of sizeLimit.others) {
      const {size} = s;
      checkNumber(size, {
        name: '文件尺寸',
        min: 0,
      });
    }
    // 文件数量
    checkNumber(countLimit.default, {
      name: '每天文件上传数量',
      min: 0
    });
    for(const s of countLimit.others) {
      checkNumber(s.count, {
        name: '每天文件上传数量',
        min: 0
      });
    }
    await db.SettingModel.updateOne({_id: 'upload'}, {
      $set: {
        c: {
          watermark,
          sizeLimit,
          countLimit,
          extensionLimit
        }
      }
    });
    if(files.normalWatermark) {
      await db.AttachmentModel.saveWatermark(files.normalWatermark, 'normal');
    }
    if(files.smallWatermark) {
      await db.AttachmentModel.saveWatermark(files.smallWatermark, 'small');
    }
    await db.SettingModel.saveSettingsToRedis('upload');
    await next();
  });
module.exports = router;
