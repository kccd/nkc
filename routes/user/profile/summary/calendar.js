const moment = require("moment");
module.exports = async (ctx, next) => {
  const {db, data, query} = ctx;
  const {targetUser} = data;
  const {year = new Date().getFullYear()} = query;
  data.posts = await db.PostModel.find({
    uid: targetUser.uid,
    toc: {
      $gte: new Date(`${year}-1-1 00:00:00`),
      $lt: new Date(`${year+1}-1-1 00:00:00`)
    }
  }, {
    toc: 1
  });
  await next();
};