const { getJsonStringTextSlice } = require('../../nkcModules/json');
const { renderHTMLByJSON } = require('../../nkcModules/nkcRender/json');

module.exports = async (ctx, next) => {
  //获取引用数据
  const { db, data, params, query, nkcModules } = ctx;
  const { _id } = params;
  let { source } = query;
  source = (await db.CommentModel.getCommentSources())[source];
  const { stable: stableType } = await db.DocumentModel.getDocumentTypes();
  const { normal: normalStatus } = await db.DocumentModel.getDocumentStatus();
  //获取被引用的文档
  const document = await db.DocumentModel.findOne({ _id, type: stableType });
  if (document.status !== normalStatus) ctx.throw(403, '权限不足');
  if (!document) ctx.throw(400, '未找到引用信息，请刷新后重试');
  let comment = await db.CommentModel.findOne({ did: document.did });
  if (!comment) ctx.throw(400, '未找到引用信息，请刷新后重试');
  comment = await db.CommentModel.extendPostComments({ comments: [comment] });
  const {
    order,
    _id: commentId,
    user,
    did,
    sid,
    source: commentSource,
    docId,
  } = comment[0];
  data.quote = {
    _id: commentId,
    order,
    docId,
    comment: comment[0],
    ...user,
    did,
    sid,
    commentSource,
    content:
      document.l === 'json'
        ? getJsonStringTextSlice(document.content, 100)
        : nkcModules.nkcRender.htmlToPlain(document.content, 100),
  };
  await next();
};
