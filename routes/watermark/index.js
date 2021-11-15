const path = require("path");
const router = require("koa-router")();
const FILE = require("../../nkcModules/file");
const statics = require("../../settings/statics");
router
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
