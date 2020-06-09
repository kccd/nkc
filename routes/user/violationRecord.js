const router = require('koa-router')();

router.get('/', async (ctx, next) => {
  const {data, db, params} = ctx;
  const {uid} = params;
  // 此用户的违规记录
  const violationRecord = await db.UsersScoreLogModel.find({
    uid: uid,
    operationId: 'violation'
  });
  // 此用户被删帖子和退修记录
  const toDraftAndToRecycle = await db.DelPostLogModel.find({
    delUserId: uid,
    delType: {$in: ["toDraft", "toRecycle"]}
  });
  // 类型名中文映射
  const typeMap = {
    "toDraft": "退修",
    "toRecycle": "删除"
  };
  // 聚合
  data.record = [
    ...violationRecord.map(record => {
      return {
        toc: record.toc,
        type: "违规",
        reason: record.description
      };
    }),
    ...toDraftAndToRecycle.map(record => {
      return {
        toc: record.toc,
        type: typeMap[record.delType],
        reason: record.reason
      }
    })
  ];
  data.blacklistCount = await db.BlacklistModel.getBlacklistCount(uid);
  await next();
});

module.exports = router;
