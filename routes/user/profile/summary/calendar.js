const moment = require("moment");
module.exports = async (ctx, next) => {
  const {db, data, query} = ctx;
  const {targetUser} = data;
  const {year = new Date().getFullYear()} = query;
  const posts = await db.PostModel.aggregate([
    {
      $match: {
        uid: targetUser.uid,
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
};