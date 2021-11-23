const router = require("koa-router")();
const FILE = require("../../nkcModules/file");
const statics = require("../../settings/statics");
//获取偏好设置用户水印图
router
  .get('/:uid', async (ctx, next) => {
    const {db, data, params, query, state} = ctx;
    const {type, style} = query;
    const {uid} = params;
    let coverPath;
    if(uid !== state.uid) ctx.throw(4003, "你没有权限访问");
    coverPath = await db.SettingModel.getAppsWatermarkPath(state.uid, type, style);
    console.log(coverPath);
    ctx.filePath = coverPath;
    await next();
  })
  .get('/', async (ctx, next) => {
    const {db, data, params, query} = ctx;
    const {type, status} = query;
    let FILEPATH = '';
    if(type === 'PWN') {
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
    if(!isFile) {
      if(status === 'small') {
        FILEPATH = statics.smallWatermark;
      } else  {
        FILEPATH = statics.normalWatermark;
      }
    }
    ctx.filePath = FILEPATH;
    await next();
  })
module.exports = router;
