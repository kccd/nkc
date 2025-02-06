const router = require('koa-router')();
const FILE = require('../../nkcModules/file');
const statics = require('../../settings/statics');
const { OnlyUser, OnlyOperation } = require('../../middlewares/permission');
const tools = require('../../nkcModules/tools');
const {
  secretWatermarkService,
} = require('../../services/watermark/secretWatermark.service');
const ContentDisposition = require('content-disposition');
const { Operations } = require('../../settings/operations');
//获取偏好设置用户水印图
router
  .get('/secret', OnlyUser(), async (ctx, next) => {
    const { uid } = ctx.state;
    const { id } = ctx.query;
    if (!id) {
      ctx.throw(400, '参数错误');
    }
    ctx.fileBuffer = await secretWatermarkService.generateWatermark(uid, id);
    ctx.set(
      'Content-Disposition',
      ContentDisposition('watermark.png', { type: 'inline' }),
    );
    ctx.set('Content-Type', 'image/png');
    await next();
  })
  .get(
    '/secret/decode',
    OnlyOperation(Operations.decodeSecretWatermark),
    async (ctx, next) => {
      const { text, id } = ctx.query;
      const targetUid = await secretWatermarkService.decodeText(text, id);
      let targetUser = await ctx.db.UserModel.findOne({ uid: targetUid });
      if (targetUser) {
        targetUser = {
          uid: targetUser.uid,
          username: targetUser.username,
          homeUrl: tools.getUrl('userHome', targetUser.uid),
        };
      }
      ctx.apiData = {
        targetUser: targetUser,
      };
      await next();
    },
  )
  .get('/media', OnlyUser(), async (ctx, next) => {
    const { db, query, state } = ctx;
    const { type, style } = query;
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
