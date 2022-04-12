module.exports = async (ctx, next) => {
  //获取需要编辑的评论的内容
  const {db, data, params, state} = ctx;
  const {_id} = params;
  let comment = await db.CommentModel.findOne({_id});
  if(comment.uid !== state.uid) return ctx.throw(401, '权限不足！');
  //获取测试版评论，如果每页就获取正式版
  comment = await comment.extendEditorComment();
  data.comment = comment;
  await next();
};
