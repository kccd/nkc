const {
  questionService,
} = require('../../../../services/exam/question.service');
const {
  ThrowForbiddenResponseTypeError,
} = require('../../../../nkcModules/error');
const { ResponseTypes } = require('../../../../settings/response');
const router = require('koa-router')();
const { OnlyUser } = require('../../../../middlewares/permission');
const { DynamicOperations } = require('../../../../settings/operations.js');

router.put('/', OnlyUser(), async (ctx, next) => {
  const { body, params, state } = ctx;
  const { fields, files } = body;
  const { questionId } = params;
  const question = await questionService.getQuestionById(Number(questionId));
  // 仅自己或拥有编辑所有试题权限的用户才能编辑试题
  if (
    state.uid !== question.uid &&
    !ctx.permission(DynamicOperations.modifyAllQuestions)
  ) {
    ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
  }

  if (question.disabled) {
    ThrowForbiddenResponseTypeError(
      ResponseTypes.FORBIDDEN_BECAUSE_QUESTION_DISABLED,
    );
  }
  const imageFile = files && files.image ? files.image : null;
  const form = JSON.parse(fields.form);
  const { type, volume, tags, hasImage, content, contentDesc, answer } = form;
  await questionService.checkQuestionInfo({
    type,
    volume,
    tags,
    content,
    contentDesc,
    answer,
  });
  const newQuestion = await questionService.modifyQuestion({
    _id: question._id,
    type,
    volume,
    oldAuth: question.auth,
    hasImage,
    tags,
    content,
    contentDesc,
    answer,
  });
  if (imageFile) {
    await newQuestion.updateImage(imageFile);
  }
  await next();
});

module.exports = router;
