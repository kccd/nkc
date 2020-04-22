const router = require('koa-router')();

router.get('/', async (ctx, next) => {
  const {data, db, params} = ctx;
  const {uid} = params;
  const targetUser = await db.UserModel.findOnly({uid});
  // 此用户的违规记录
  const violationRecord = await db.UsersScoreLogModel.find({
    uid: uid,
    operationId: 'violation'
  });
  // 此用户被删帖子和退修记录
  const toDraftAndtoRecycle = await db.DelPostLogModel.find({
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
    ...toDraftAndtoRecycle.map(record => {
      return {
        toc: record.toc,
        type: typeMap[record.delType],
        reason: record.reason
      }
    })
  ];
  await next();
});

module.exports = router;
