const router = require('koa-router')();
const visit = async (ctx, next)=>{
  const { data, db } = ctx;
  const {uid} = ctx.state;
  data.visitUserLogs = await db.UserModel.visitUserLogs(uid);
  data.visitSelfLogs = await db.UserModel.visitSelfLogs(uid)
  data.visitThreadLogs = await db.UserModel.recentReading(uid);
  await next && next();
};
const active = async (ctx, next)=>{
  const {db, data} = ctx;
  const {uid} = ctx.state;

  data.pie = await db.UserModel.getUserPostSummary(uid);
  await next && next();

}
const calendar = async (ctx, next)=>{
  const {db, data, query} = ctx;
  const {uid} = ctx.state;
  let {year = new Date().getFullYear()} = query;
  const posts = await db.PostModel.aggregate([
    {
      $match: {
        uid,
        toc: {
          $gte: new Date(`${year}-1-1 00:00:00`),
          $lt: new Date(`${year+1}-1-1 00:00:00`)
        }   
      }
    },
    {
      $project: {
        _id: 0,
        time: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$toc"
          }
        }
      }
    },
    {
      $group: {
        _id: "$time",
        count: {
          $sum: 1
        }
      }
    }
  ]);
  data.posts = posts || [];
  await next && next();
}
router
.get('/calendar', calendar)
// 活跃领域
.get('/active', active)
.get('/visit', visit)
// 获取三个数据统一返回
.get("/data", async (ctx, next)=>{
  await visit(ctx);
  await active(ctx);
  await calendar(ctx);
  await next();
})
module.exports=router