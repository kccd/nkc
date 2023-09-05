const Router = require('koa-router');
const editorRouter = new Router();
const { DynamicOperations } = require('../../settings/operations.js');
const {
  questionTagService,
} = require('../../services/exam/questionTag.service');
editorRouter.get('/', async (ctx, next) => {
  const { query, data, db, state } = ctx;
  const { qid } = query;
  data.question = null;
  data.tags = [];
  const modifyAllQuestionPermission = ctx.permission(
    DynamicOperations.modifyAllQuestions,
  );
  if (qid) {
    const question = await db.QuestionModel.findOnly({ _id: Number(qid) });
    if (question.uid !== state.uid && !modifyAllQuestionPermission) {
      ctx.throw(403, '权限不足');
    }
    if (question.disabled) {
      ctx.throw(403, '试题已被屏蔽，无法修改');
    }
    if (question.auth === true && !modifyAllQuestionPermission) {
      ctx.throw(403, '试题已通过审核，无法修改');
    }
    data.tags = await questionTagService.getTagsById(question.tags);
    data.question = question;
  }
  ctx.template = 'exam/question/editor.pug';
  await next();
});
module.exports = editorRouter;
