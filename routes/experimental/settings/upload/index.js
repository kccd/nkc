const router = require("koa-router")();
const fs = require("fs");
const path = require('path')
const fsPromise = fs.promises;
const statics = require("../../../../settings/statics");
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const uploadSettings = await db.SettingModel.getSettings('upload');
    data.certList = await db.RoleModel.getCertList(['visitor']);
    uploadSettings.countLimit.others = await db.RoleModel.filterSettings(uploadSettings.countLimit.others, ['visitor']);
    uploadSettings.extensionLimit.others = await db.RoleModel.filterSettings(uploadSettings.extensionLimit.others, ['visitor']);
    data.watermarkScore = await db.SettingModel.getScoreByOperationType('watermarkScore');
    data.uploadSettings = uploadSettings;
    ctx.template = "experimental/settings/upload/upload.pug";
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, nkcModules, data} = ctx;
    const {fields, files} = body;
    const {checkNumber} = nkcModules.checkData;
    const uploadSettings = JSON.parse(fields.uploadSettings);
    let {watermark, sizeLimit, countLimit, extensionLimit, videoVBRControl} = uploadSettings;
    watermark.enabled = !!watermark.enabled;
    if(watermark.transparency < 0) watermark.transparency = 0;
    if(watermark.transparency > 100) watermark.transparency = 100;
    countLimit.others = await db.RoleModel.filterSettings(countLimit.others, ['visitor']);
    extensionLimit.others = await db.RoleModel.filterSettings(extensionLimit.others, ['visitor']);
    // 水印尺寸限制
    checkNumber(watermark.picture.minHeight, {
      name: '图片水印尺寸限制最小高度',
      min: 0
    });
    checkNumber(watermark.picture.minWidth, {
      name: '图片水印尺寸限制最小宽度',
      min: 0
    });
    checkNumber(watermark.video.minHeight, {
      name: '视频水印尺寸限制最小高度',
      min: 0
    });
    checkNumber(watermark.video.minWidth, {
      name: '视频水印尺寸限制最小宽度',
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
          extensionLimit,
          videoVBRControl
        }
      }
    });
    const watermarkSize = 1024 * 1024;
    //将水印保存在默认文件夹
    if(files.normalPictureWatermark) {
      if (files.normalPictureWatermark.size > watermarkSize) ctx.throw(400, '图片默认水印大小不能超过1M!');
      await fsPromise.copyFile(files.normalPictureWatermark.path, statics.normalPictureWatermark);
    }
    if(files.smallPictureWatermark) {
      if (files.smallPictureWatermark.size > watermarkSize) ctx.throw(400, '图片小水印大小不能超过1M!');
      await fsPromise.copyFile(files.smallPictureWatermark.path, statics.smallPictureWatermark);
    }
    if(files.normalVideoWatermark) {
      if (files.normalVideoWatermark.size > watermarkSize) ctx.throw(400, '视频默认水印大小不能超过1M!');
      await fsPromise.copyFile(files.normalVideoWatermark.path, statics.normalVideoWatermark);
    }
    if(files.smallVideoWatermark) {
      if (files.smallVideoWatermark.size > watermarkSize) ctx.throw(400, '视频小水印大小不能超过1M!');
      await fsPromise.copyFile(files.smallVideoWatermark.path, statics.smallVideoWatermark);
    }
    await db.SettingModel.saveSettingsToRedis('upload');
    data.uploadSettings = await db.SettingModel.getSettings('upload');
    await next();
  });
module.exports = router;
