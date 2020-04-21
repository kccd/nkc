const router = require('koa-router')();
router.get('/', async (ctx, next) => {
  const {nkcModules, data, db, params, query} = ctx;
  const {user} = data;
  const {uid} = params;
  const {page = 0} = query;
  const targetUser = await db.UserModel.findOnly({uid});
  // 此用户的违规记录
  let violationRecord = await db.UsersScoreLogModel.find({
    uid: uid,
    operationId: 'violation'
  });
  // 此用户被删帖子和退修记录
  let toDraftAndtoRecycle = await db.DelPostLogModel.find({
    userId: uid,
    $or: [{delType: "toDraft"}, {delType: "toRecycle"}]
  });
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
  // 用户信息
  data.user = targetUser;
  await next();
});


// 类型名中文映射
const typeMap = {
  "toDraft": "退修",
  "toRecycle": "删除"
}


module.exports = router;
