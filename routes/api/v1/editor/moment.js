const router = require('koa-router')();
const { OnlyUser } = require('../../../../middlewares/permission');
const {
  EditorMomentService,
} = require('../../../../services/editor/moment.service');
const { getUrl } = require('../../../../nkcModules/tools');
const videoSize = require('../../../../settings/video');
router
  .get('/', OnlyUser(), async (ctx, next) => {
    const {
      params: { mid },
      db,
      permission,
      state: { uid },
    } = ctx;
    //判断用户是否拥有编辑电文的权限
    await EditorMomentService.checkeditOtherUserMomentPermission(
      uid,
      mid,
      permission,
    );
    ctx.apiData = await db.MomentModel.getEditorMomentDataByMid(mid);
    await next();
  })
  .put('/', OnlyUser(), async (ctx, next) => {
    const {
      params: { mid },
      db,
      permission,
      state: { uid },
      address: { ip, port },
      body: { content, resourcesId },
    } = ctx;
    //判断用户是否拥有编辑电文的权限
    await EditorMomentService.checkeditOtherUserMomentPermission(
      uid,
      mid,
      permission,
    );
    const { moment: momentSource } =
      await db.DocumentModel.getDocumentSources();
    const toc = new Date();
    //检查内容是否有编辑版本且没有提交过
    const document = await db.DocumentModel.getBetaDocumentBySource(
      momentSource,
      mid,
    );
    //获取目前编辑的moment的did
    const { did } = await db.MomentModel.findOnly({ _id: mid }, { did: 1 });
    //限制动态图片和视频的数量
    const newResourcesId = await db.MomentModel.replaceMomentResourcesId(
      resourcesId,
    );
    //生成document的beta版本
    if (!document) {
      await db.DocumentModel.createBetaDocument({
        ip,
        port,
        uid,
        toc,
        source: momentSource,
        sid: mid,
        content,
        files: newResourcesId,
        did,
      });
    } else {
      const { _id } = document;
      await db.DocumentModel.updateOne(
        { _id },
        {
          $set: {
            content,
            files: newResourcesId,
          },
        },
      );
    }
    await next();
  })
  .post('/', OnlyUser(), async (ctx, next) => {
    const {
      state: { uid },
      permission,
      body: { content, resourcesId },
      params: { mid },
      db,
    } = ctx;
    const ip = await db.IPModel.saveIPAndGetToken(ctx.address);
    const addr = await db.IPModel.getIpAddr(ctx.address);
    //判断用户是否拥有编辑电文的权限
    await EditorMomentService.checkeditOtherUserMomentPermission(
      uid,
      mid,
      permission,
    );
    //限制动态图片和视频的数量
    const newResourcesId = await db.MomentModel.replaceMomentResourcesId(
      resourcesId,
    );
    //电文来源
    const { moment: momentSource } =
      await db.DocumentModel.getDocumentSources();
    //电文状态
    const { unknown: unknownMomentStatus, normal: normalMomentStatus } =
      await db.MomentModel.getMomentStatus();
    //document类型
    const {
      stable: stableDocumentTypes,
      stableHistory: stableHistoryDocumentTypes,
    } = await db.DocumentModel.getDocumentTypes();
    //document状态
    const { unknown: unknownDocumentStatus, normal: normalDocumentStatus } =
      await db.DocumentModel.getDocumentStatus();
    //获取现在的moment
    const moment = await db.MomentModel.findOnly({ _id: mid }, { did: 1 });
    //获取编辑版本的document
    const document = await db.DocumentModel.getBetaDocumentBySource(
      momentSource,
      mid,
    );
    const tlm = new Date();
    //将原来的正式版本变为历史版本
    await db.DocumentModel.updateOne(
      {
        did: moment.did,
        source: momentSource,
        type: stableDocumentTypes,
      },
      {
        $set: {
          type: stableHistoryDocumentTypes,
        },
      },
    );
    const needReview = await document.getReviewStatusAndCreateReviewLog();
    let matchDocument = {
      content,
      files: newResourcesId,
      type: stableDocumentTypes,
      status: normalDocumentStatus,
      tlm,
      ip,
      addr,
    };
    let matchMoment = {
      files: newResourcesId,
      status: normalMomentStatus,
      tlm,
    };
    //需要审核
    if (needReview) {
      matchDocument.status = unknownDocumentStatus;
      matchMoment.status = unknownMomentStatus;
    }
    //将编辑版本的document变成正式版
    await db.DocumentModel.updateOne(
      { _id: document._id },
      {
        $set: matchDocument,
      },
    );
    //更新正式版moment的内容
    await db.MomentModel.updateOne(
      { _id: mid },
      {
        $set: matchMoment,
      },
    );
    const newMoment = await db.MomentModel.findOnly(
      { _id: mid },
      { files: 1, did: 1, status: 1, tlm: 1 },
    );
    //更新resource
    newMoment.updateResourceReferences();
    const newDocument = await db.DocumentModel.findOnly(
      { did: newMoment.did, source: momentSource, type: stableDocumentTypes },
      { content: 1, addr: 1 },
    );
    if (!needReview) {
      //检测document中的@用户并发送消息给用户
      await newDocument.sendMessageToAtUsers('article');
    }
    const filesData = [];
    //准备附件数据
    if (newMoment.files.length > 0) {
      const resourcesObj =
        await db.ResourceModel.getResourcesObjectByResourcesId(newMoment.files);
      for (const rid of newMoment.files) {
        const resource = resourcesObj[rid];
        if (!resource) {
          continue;
        }
        await resource.setFileExist();
        const {
          mediaType,
          defaultFile,
          disabled,
          isFileExist,
          visitorAccess,
          mask,
        } = resource;
        let fileData;

        if (mediaType === 'mediaPicture') {
          const { height, width, name: filename } = defaultFile;
          fileData = {
            rid,
            type: 'picture',
            url: getUrl('resource', rid),
            urlLG: getUrl('resource', rid, 'lg'),
            height,
            width,
            filename,
            disabled,
            lost: !isFileExist,
          };
        } else {
          const { name: filename } = defaultFile;
          const sources = [];
          for (const { size, dataSize } of resource.videoSize) {
            const { height } = videoSize[size];
            const url = getUrl('resource', rid, size) + '&w=' + resource.token;
            sources.push({
              url,
              height,
              dataSize,
            });
          }
          fileData = {
            rid: rid,
            type: 'video',
            coverUrl: getUrl('resource', rid, 'cover'),
            visitorAccess,
            mask,
            sources,
            filename,
            disabled,
            lost: !isFileExist,
          };
        }

        filesData.push(fileData);
      }
    }
    const newContent = await db.MomentModel.renderContent(newDocument.content);
    ctx.apiData = {
      content: newContent,
      files: filesData,
      status: newMoment.status,
      tlm: newMoment.tlm,
      addr: newDocument.addr,
    };
    await next();
  });

module.exports = router;
