const router = require('koa-router')();
const FILE = require('../../nkcModules/file');
const statics = require('../../settings/statics');
const { OnlyUser } = require('../../middlewares/permission');
//获取偏好设置用户水印图
router
  .get('/:uid', OnlyUser(), async (ctx, next) => {
    const { db, params, query, state } = ctx;
    const { type, style } = query;
    const { uid } = params;
    if (uid !== state.uid) {
      ctx.throw(403, '你没有权限访问');
    }
    ctx.filePath = await db.SettingModel.getWatermarkCoverPathByTypeStyle(
      state.uid,
      type,
      style,
    );
    await next();
  })
  .get('/', OnlyUser(), async (ctx, next) => {
    const { query } = ctx;
    const { type, status } = query;
    let FILEPATH = '';
    if (type === 'PWN') {
      FILEPATH = statics.normalPictureWatermark;
    } else if (type === 'PWS') {
      FILEPATH = statics.smallPictureWatermark;
    } else if (type === 'VWN') {
      FILEPATH = statics.normalVideoWatermark;
    } else if (type === 'VWS') {
      FILEPATH = statics.smallVideoWatermark;
    }
    // 水印路径
    const isFile = await FILE.access(FILEPATH);
    if (!isFile) {
      if (status === 'small') {
        FILEPATH = statics.smallWatermark;
      } else {
        FILEPATH = statics.normalWatermark;
      }
    }
    ctx.filePath = FILEPATH;
    await next();
  });
module.exports = router;
