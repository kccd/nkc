module.exports = async (ctx, next) => {
  const {db, params,} = ctx;
  const {_id} = params;
  const document = await db.DocumentModel.findOnly({_id});
  if(!document) ctx.throw(400, `未找到ID为${_id}的document`);
  const comment = await db.CommentModel.findOnly({_id: document.sid});
  if(!comment) ctx.throw(400, `未找到ID为${document.sid}的comment`);
  const isModerator = ctx.permission('superModerator') || bookPermission === 'admin'?true:false;
  if(!isModerator) ctx.throw(403, `您没有权限处理ID为${document._id}的document`);
  if(document.status !== 'disabled') ctx.throw(400, `ID为${document._id}的回复未被屏蔽，请刷新`);
  const {normal: normalStatus} = await db.DocumentModel.getDocumentStatus();
  //更新document的状态
  await document.setStatus(normalStatus);
  await next();
};
