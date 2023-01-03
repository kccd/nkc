module.exports = async (ctx, next) => {
  const {state, nkcModules, query, data, db} = ctx;
  const {targetUser} = data;
  const {t, page} = query;
  // 用户积分
  if(targetUser.uid !== state.uid && !ctx.permission('viewUserScores')) {
    ctx.throw(403, '权限不足');
  }
  data.targetUserScores = await db.UserModel.getUserScores(targetUser.uid);
  const q = {
    verify: true
  };
  if(t === 'in') {
    q.to = targetUser.uid;
  } else if(t === 'payout') {
    q.from = targetUser.uid;
  } else {
    q.$or = [
      {
        from: targetUser.uid
      }, {
        to: targetUser.uid
      }
    ]
  }
  const count = await db.KcbsRecordModel.countDocuments(q);
  const paging = nkcModules.apiFunction.paging(page, count);
  let kcbsRecords = await db.KcbsRecordModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage)
  await db.KcbsRecordModel.hideSecretInfo(kcbsRecords);
  const kcbNumber = await db.KcbsRecordModel.extendKcbsRecords(kcbsRecords);
  data.kcbsRecords = kcbNumber.map((item)=>{
    const m = item;
    m.lang = nkcModules.translate.translate(nkcModules.language.languageNames.zh_cn, 'kcbsTypes', item.type);
    return m;
  });
  data.paging = paging;
  data.t = t;
  targetUser.kcb = await db.UserModel.updateUserKcb(targetUser.uid);
  data.nkcBankName = await db.SettingModel.getNKCBankName();
  data.name = '我的账单';
  await next();
};
