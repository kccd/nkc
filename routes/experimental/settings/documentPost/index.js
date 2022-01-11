const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data, state} = ctx;
    data.documentPostSettings = await db.SettingModel.getSettings('documentPost');
    const sources = await db.DocumentModel.getDocumentSources();
    data.sources = [];
    for(const sourceName in sources) {
      const sourceValue = sources[sourceName];
      const name = state
        .lang('documentSources', sourceValue);
      data.sources.push({
        name,
        type: sourceValue
      });
    }
    data.roleList = await db.RoleModel.getCertList(['default', 'visitor']);
    const reviewSettings = await db.SettingModel.getSettings('review');
    data.keywordsGroup = [];
    for(const group of reviewSettings.keyword.wordGroup) {
      const {
        id, name
      } = group;
      data.keywordsGroup.push({
        id,
        name
      });
    }
    ctx.template = 'experimental/settings/documentPost/documentPost.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, nkcModules, state} = ctx;
    const {documentPostSettings} = body;
    const {checkNumber} = nkcModules.checkData;
    const sources = await db.DocumentModel.getDocumentSources();
    const sourcesType = Object.values(sources);
    const sourcesObj = {};
    for(const s of sourcesType) {
      sourcesObj[s] = state.lang('documentSources', s);
    }
    for(const sourceType in documentPostSettings) {
      const sourceName = sourcesObj[sourceType];
      const {postPermission, postReview} = documentPostSettings[sourceType];
      if(![0, 1, 2, 3].includes(postPermission.authLevelMin)) {
        ctx.throw(400, `最小认证等级错误 authLevelMin=${postPermission.authLevelMin}`);
      }
      postPermission.examVolumeA = !!postPermission.examVolumeA;
      postPermission.examVolumeB = !!postPermission.examVolumeB;
      checkNumber(postPermission.examNotPass.count, {
        name: `${sourceName} - 未考试时发表条数`,
        min: 1,
      });
      postPermission.examNotPass = {
        status: !!postPermission.examNotPass.status,
        limited: !!postPermission.examNotPass.limited,
        count: postPermission.examNotPass.count
      };
      checkNumber(postPermission.defaultInterval.interval, {
        name: `${sourceName} - 默认发表间隔`,
        min: 0,
        fractionDigits: 2
      });
      postPermission.defaultInterval = {
        limited: postPermission.defaultInterval.limited,
        interval: postPermission.defaultInterval.interval
      };
      checkNumber(postPermission.defaultCount.count, {
        name: `${sourceName} - 默认发表条数`,
        min: 0
      });
      postPermission.defaultCount = {
        limited: !!postPermission.defaultCount.limited,
        count: postPermission.defaultCount.count
      };
      let _intervalLimit = [];
      for(const item of postPermission.intervalLimit) {
        if(!item.id) ctx.throw(400, `${sourceName} - 发表间隔限制中存在未选择角色的配置`);
        checkNumber(item.interval, {
          name: `${sourceName} - ${item.id} - 发表间隔`,
          min: 0,
          fractionDigits: 2
        });
        _intervalLimit.push({
          id: item.id,
          limited: !!item.limited,
          interval: item.interval
        });
      }
      postPermission.intervalLimit = _intervalLimit;
      let _countLimit = [];
      for(const item of postPermission.countLimit) {
        if(!item.id) ctx.throw(400, `${sourceName} - 发表条数限制中存在未选择角色的配置`);
        checkNumber(item.count, {
          name: `${sourceName} - ${item.id} - 发表条数`,
          min: 0
        });
        _countLimit.push({
          id: item.id,
          limited: !!item.limited,
          count: item.count
        });
      }
      postPermission.countLimit = _countLimit;
      checkNumber(postReview.foreign.count, {
        name: `${sourceName} - 海外注册用户审核条数`,
        min: 0
      });
      postReview.foreign = {
        nationCode: postReview.foreign.nationCode,
        type: postReview.foreign.type,
        count: postReview.foreign.count
      };
      checkNumber(postReview.notPassVolumeA.count, {
        name: `${sourceName} - 未通过 A 卷的用户的审核条数`,
        min: 0
      });
      postReview.notPassVolumeA = {
        type: postReview.notPassVolumeA.type,
        count: postReview.notPassVolumeA.count
      };
      const _blacklist = [];
      for(const item of postReview.blacklist) {
        if(!item.id) ctx.throw(400, `${sourceName} - 审核条数设置中存在未选择角色的配置`);
        checkNumber(item.count, {
          name: `${sourceName} - ${item.id} - 审核条数`,
          min: 0
        });
        _blacklist.push({
          id: item.id,
          type: item.type,
          count: item.count
        });
      }
      postReview.blacklist = _blacklist;
    }
    await db.SettingModel.updateOne({_id: 'documentPost'}, {
      $set: {
        c: documentPostSettings
      }
    });
    await db.SettingModel.saveSettingsToRedis('documentPost');
    await next();
  });
module.exports = router;