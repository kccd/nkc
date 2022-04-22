const {getFilePathByTime} = require('../tools');
module.exports = async (ctx, next) => {
  const {query, data} = ctx;
  let {year, month} = query;
  year = parseInt(year);
  month = parseInt(month);
  if(isNaN(year) || isNaN(month)) ctx.throw(400, `指定的日期错误 year=${year}, month=${month}`);
  data.files = await getFilePathByTime(year, month);
  await next();
};