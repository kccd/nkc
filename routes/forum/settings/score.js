const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {forum} = data;
    data.forumAvailableScoreOperations = await db.SettingModel.getForumAvailableScoreOperations();
    data.forumScoreOperations = await db.SettingModel.getForumScoreOperations(forum.fid);
    data.scores = await db.SettingModel.getScores();
    data.scoresType = await db.SettingModel.getScoresType();
    ctx.template = 'forum/settings/score.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {nkcModules, data, db, body} = ctx;
    const {forumScoreOperations} = body;
    const {forum} = data;
    const {checkNumber} = nkcModules.checkData;
    const scoresType = await db.SettingModel.getScoresType();
    const forumAvailableScoreOperations = await db.SettingModel.getForumAvailableScoreOperations();
    const FSOTypes = forumAvailableScoreOperations.map(s => s.type);
    const _forumScoreOperations = await db.SettingModel.getForumScoreOperations(forum.fid);
    let _forumScoreOperationsId = _forumScoreOperations.map(f => f._id);
    _forumScoreOperationsId = new Set(_forumScoreOperationsId);
    for(const scoreOperation of forumScoreOperations) {
      const {type, cycle, count} = scoreOperation;
      if(!FSOTypes.includes(type)) ctx.throw(400, `未知的积分策略操作类型 type: ${type}`);
      if(cycle !== 'day') ctx.throw(400, '积分策略周期设置错误');
      checkNumber(count, {
        name: '积分策略次数',
      });
      if(count < 0 && count !== -1) ctx.throw(400, '积分策略次数设置错误');
      const _operation = {
        type, cycle, count,
        from: 'forum',
        fid: forum.fid,
        forumAvailable: true,
      };
      for(const scoreType of scoresType) {
        const value = scoreOperation[scoreType];
        checkNumber(value, {
          name: `积分策略中的加减积分值`
        });
        _operation[scoreType] = value;
      }
      let forumScoreOperation = await db.ScoreOperationModel.findOne({
        from: 'forum',
        fid: forum.fid,
        type
      });
      if(forumScoreOperation) {
        await forumScoreOperation.updateOne(_operation);
      } else {
        _operation._id = await db.SettingModel.operateSystemID('scoreOperations', 1);
        forumScoreOperation = db.ScoreOperationModel(_operation);
        await forumScoreOperation.save();
      }
      _forumScoreOperationsId.delete(forumScoreOperation._id);
    }
    // 删除前端未提交的当前专业积分策略
    await db.ScoreOperationModel.deleteMany({
      _id: {$in: [..._forumScoreOperationsId]},
      from: 'forum',
      fid: forum.fid
    });
    await db.ScoreOperationModel.saveAllScoreOperationToRedis();
    await next();
  });
module.exports = router;
