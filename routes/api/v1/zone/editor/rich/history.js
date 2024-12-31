const Router = require('koa-router');
const {
  renderHTMLByJSON,
} = require('../../../../../../nkcModules/nkcRender/json');
const {
  documentSources,
  documentTypes,
} = require('../../../../../../settings/document');
const {
  momentExtenderService,
} = require('../../../../../../services/moment/momentExtender.service');
const {
  OnlyUnbannedUser,
} = require('../../../../../../middlewares/permission');
const { momentStatus } = require('../../../../../../settings/moment');
const {
  getRichJsonContentLength,
} = require('../../../../../../nkcModules/checkData');
const router = new Router();
router
  .get('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { query, db, state, data } = ctx;
    const documentId = parseInt(query.documentId);
    const momentId = query.momentId;
    const moment = await momentExtenderService.getMomentById(momentId);
    if (moment.uid !== state.uid) {
      ctx.throw(403, '权限不足');
    }
    const historyDocuments = await db.DocumentModel.find({
      source: documentSources.moment,
      sid: moment._id,
      type: {
        $in: [documentTypes.betaHistory, documentTypes.stableHistory],
      },
    }).sort({ toc: -1 });
    const timeList = [];
    let targetDocument = null;
    for (const document of historyDocuments) {
      if (targetDocument === null && documentId === document._id) {
        targetDocument = document;
      }
      timeList.push({
        toc: document.toc,
        tlm: document.tlm,
        documentId: document._id,
        active: false,
        wordCount: getRichJsonContentLength(document.content),
      });
    }
    if (targetDocument === null && historyDocuments.length > 0) {
      targetDocument = historyDocuments[0];
    }
    timeList.map((item) => {
      item.active = item.documentId === targetDocument._id;
    });

    let documentInfo = null;
    if (targetDocument) {
      // 临时代码，后续需要调用 document.getRenderingData(uid);
      const resourcesId = await db.ResourceModel.getResourcesByJson(
        targetDocument.content,
      );
      const resources = await db.ResourceModel.find({
        rid: { $in: resourcesId },
      });
      for (const resource of resources) {
        await resource.setFileExist();
      }
      const html = renderHTMLByJSON({
        json: targetDocument.content,
        resources: resources,
        xsf: data.user ? data.user.xsf : 0,
      });
      documentInfo = {
        toc: targetDocument.toc,
        tlm: targetDocument.tlm,
        html,
        documentId: targetDocument._id,
      };
    }

    ctx.apiData = {
      timeList,
      editorUrl:
        moment.status === momentStatus.default
          ? '/z/editor/rich'
          : `/z/editor/rich?id=${moment._id}`,
      documentInfo,
    };
    await next();
  })
  .post('/rollback', OnlyUnbannedUser(), async (ctx, next) => {
    const { state, body, db } = ctx;
    const { momentId, documentId } = body;
    const moment = await momentExtenderService.getMomentById(momentId);
    if (moment.uid !== state.uid) {
      ctx.throw(403, '权限不足');
    }
    if (!documentId) {
      ctx.throw(400, 'DocumentId不能为空');
    }
    const betaDocument = await db.DocumentModel.findOne({
      source: documentSources.moment,
      sid: moment._id,
      type: documentTypes.beta,
    });
    if (!betaDocument) {
      ctx.throw(400, '电文未处于编辑状态，不允许基于历史版本编辑。');
    }
    const historyDocument = await db.DocumentModel.findOne({
      _id: documentId,
      source: documentSources.moment,
      sid: moment._id,
      type: {
        $in: [documentTypes.betaHistory, documentTypes.stableHistory],
      },
    });
    if (!historyDocument) {
      ctx.throw(400, '历史版本不存在');
    }
    await betaDocument.updateOne({
      $set: {
        type: documentTypes.betaHistory,
      },
    });

    const newHistory = await historyDocument.copyToHistoryDocument('edit');
    await newHistory.updateOne({
      $set: {
        type: documentTypes.beta,
      },
    });

    await next();
  });
module.exports = router;
