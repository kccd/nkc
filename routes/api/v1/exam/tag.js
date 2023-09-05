const router = require('koa-router')();
const { Operations } = require('../../../../settings/operations.js');
const { OnlyPermission } = require('../../../../middlewares/permission');
const {
  questionTagService,
} = require('../../../../services/exam/questionTag.service');
router
  .put(
    '/',
    OnlyPermission(Operations.manageQuestionTags),
    async (ctx, next) => {
      const { name, desc } = ctx.body;
      const { tagId } = ctx.params;
      await questionTagService.checkNameDescFormat(name, desc);
      const tag = await questionTagService.modifyQuestionTag({
        _id: tagId,
        name,
        desc,
      });
      ctx.apiData = {
        tag,
      };
      await next();
    },
  )
  .del(
    '/',
    OnlyPermission(Operations.manageQuestionTags),
    async (ctx, next) => {
      const { tagId } = ctx.params;
      await questionTagService.deleteQuestionTag(tagId);
      await next();
    },
  );

module.exports = router;
