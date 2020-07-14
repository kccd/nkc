module.exports = async (ctx, next) => {
  const {nkcModules, query, data, db} = ctx;
  const {targetUser} = data;
  const {t, page} = query;
  const q = {
    verify: true
  };
  if(!t) {
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
  const count = await db.KcbsRecordModel.count(q);
  const paging = nkcModules.apiFunction.paging(page, count);
  let kcbsRecords = await db.KcbsRecordModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
  await db.KcbsRecordModel.hideSecretInfo(kcbsRecords);
  data.kcbsRecords = await db.KcbsRecordModel.extendKcbsRecords(kcbsRecords);
  data.paging = paging;
  data.t = t;
  targetUser.kcb = await db.UserModel.updateUserKcb(targetUser.uid);
  data.nkcBankName = await db.SettingModel.getNKCBankName();
  await next();
};
