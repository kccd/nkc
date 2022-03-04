const router = require('koa-router')();
router
.get('/calendar', async (ctx, next)=>{
  const {db, data, query, params} = ctx;
  const {uid} = params;
  const {year = new Date().getFullYear()} = query;
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
  data.posts = posts? posts: [];
  await next();
})
.get('/active', async (ctx, next)=>{
  const {db, data, params} = ctx;
  const {uid} = params;
  data.pie = await db.UserModel.getUserPostSummary(uid);
  await next();

})
.get('/visit', async (ctx, next)=>{
  const { data, db ,params} = ctx;
  const { uid } = params;
  // const {visitUserLogs, visitSelfLogs} = await db.UserModel.visit(uid)
  data.visitUserLogs = await db.UserModel.visitUserLogs(uid);
  data.visitSelfLogs = await db.UserModel.visitSelfLogs(uid)
  data.visitThreadLogs = await db.UserModel.recentReading(uid)
  await next();

})
module.exports=router