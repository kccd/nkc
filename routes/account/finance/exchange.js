const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, db, state} = ctx;
    const {user} = ctx;
    const {uid} = state;
    data.userScores = await db.UserModel.updateUserScores(uid);
    data.scores = await db.SettingModel.getEnabledScores();
    ctx.template = 'account/finance/exchange.pug'
    await next();
  })
  .post('/', async (ctx, next) => {
    const {state, body, db, nkcModules} = ctx;
    const {uid} = state;
    const {
      fromScoreType,
      toScoreType,
      toNum,
      fromNum,
      password,
    } = body;
    nkcModules.checkData.checkNumber(toNum, {
      name: '兑换金额',
      min: 1
    });
    const userScores = await db.UserModel.updateUserScores(uid);
    const userFromScore = userScores.find(s => s.type === fromScoreType);
    const fromScore = await db.SettingModel.getScoreByScoreType(fromScoreType);
    const toScore = await db.SettingModel.getScoreByScoreType(toScoreType);
    if(!fromScore.enabled || !toScore.enabled) ctx.throw(400, '页面数据已过期，请刷新后再试');
    let _fromNum = toNum * fromScore.weight / toScore.weight;
    _fromNum = Math.ceil(_fromNum);
    if(_fromNum !== fromNum) {
      ctx.throw(400, '页面数据已过期，请刷新后再试');
    }
    if(userFromScore.number < fromNum) ctx.throw(400, `${fromScore.name}不足`);
    if(fromNum <= 0 || toNum <= 0) {
      ctx.throw(400, '数据错误，请刷新后再试');
    }
    await db.UsersPersonalModel.checkUserPassword(uid, password);
    delete body.password;
    const fromRecord = db.KcbsRecordModel({
      _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
      scoreType: fromScoreType,
      from: uid,
      to: 'bank',
      type: 'scoreExchange',
      ip: ctx.address,
      port: ctx.port,
      num: fromNum
    });
    const toRecord = db.KcbsRecordModel({
      _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
      scoreType: toScoreType,
      from: 'bank',
      to: uid,
      type: 'scoreExchange',
      ip: ctx.address,
      port: ctx.port,
      num: toNum
    });
    try{
      await fromRecord.save();
      await toRecord.save();
    } catch(err) {
      await fromRecord.deleteOne();
      await toRecord.deleteOne();
      throw err;
    }
    await db.UserModel.updateUserScores(uid);
    await next();
  });
module.exports = router;
