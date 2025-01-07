const Router = require('koa-router');
const {
  momentExtenderService,
} = require('../../../../../services/moment/momentExtender.service');
const { OnlyOperation } = require('../../../../../middlewares/permission');
const { Operations } = require('../../../../../settings/operations');
const router = new Router();

router.post(
  '/',
  OnlyOperation(Operations.rollbackZoneMomentHistory),
  async (ctx, next) => {
    const { params, db, body } = ctx;
    const { momentId } = params;
    const moment = await momentExtenderService.getMomentById(momentId);
    const { documentId } = body;
    //document类型
    const {
      stable: stableDocumentTypes,
      stableHistory: stableHistoryDocumentTypes,
    } = await db.DocumentModel.getDocumentTypes();
    //正常电文状态
    const { normal: normalMomentStatus } =
      await db.MomentModel.getMomentStatus();
    //获取现在的moment
    //如何没有找到 moment--后期需要抛出错误
    if (!moment) {
      return ctx.throw(404, '未找到电文，请刷新后重试');
    }
    // 对于已经屏蔽、删除等不正常的电文暂不支持回滚
    if (moment.status !== normalMomentStatus) {
      return ctx.throw(403, '电文状态有误，请确认后重试');
    }
    //将原来的正式版本变为历史版本
    await db.DocumentModel.updateOne(
      {
        did: moment.did,
        type: stableDocumentTypes,
      },
      {
        $set: {
          type: stableHistoryDocumentTypes,
        },
      },
    );
    const tlm = new Date();
    //将选中的历史版本的document 克隆添加 并变成正式版
    await db.DocumentModel.createStableDocumentByStableHistoryDocument(
      documentId,
      tlm,
    );
    //更新moment的修改时间-tlm
    await db.MomentModel.updateOne(
      { _id: momentId },
      {
        $set: {
          tlm,
        },
      },
    );
    const newMoment = await db.MomentModel.findOnly(
      { _id: momentId },
      { files: 1, did: 1, status: 1, tlm: 1 },
    );
    //更新resource
    await newMoment.updateResourceReferences();
    ctx.apiData = {
      backSuccess: true,
    };
    await next();
  },
);

module.exports = router;
