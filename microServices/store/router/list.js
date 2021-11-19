const {getFilePathByTime} = require('../tools');
module.exports = async (ctx, next) => {
  const {query, data} = ctx;
  const {year, month} = query;
  data.files = await getFilePathByTime(year, month);
  await next();
};