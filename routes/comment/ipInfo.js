module.exports = async (ctx, next) => {
  const {db, data, params, query, address, permission} = ctx;
  const {_id} = params;
  if(!permission('ipinfo')) return ctx.throw(401, '权限不足');
  let comment = await db.CommentModel.findOnly({_id});
  if(!comment) ctx.throw(404, '未找到评论,请刷新后重试')
  const {stable: stableType} = await db.DocumentModel.getDocumentTypes();
  const comments = await db.CommentModel.extendDocumentOfComment([comment], stableType, [
    '_id',
    'ip',
    'port'
  ]);
  let ip = comments[0].document.ip;
  const realIp = await db.IPModel.getIPByToken(ip);
  if(realIp)  ip = realIp;
  const targetIp = ip || address;
  data.ipInfo = await db.IPModel.getIPInfoFromLocal(targetIp);
  await next();
};
