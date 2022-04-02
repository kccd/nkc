module.exports = async (ctx, next) => {
  const {data, db} = ctx;
  const {targetUser} = data;
  
  await next();
}
