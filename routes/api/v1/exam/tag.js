const router = require('koa-router')();
const { Operations } = require('../../../../settings/operations.js');
const { OnlyOperation } = require('../../../../middlewares/permission');
const {
  questionTagService,
} = require('../../../../services/exam/questionTag.service');
router
  .put('/', OnlyOperation(Operations.manageQuestionTags), async (ctx, next) => {
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
  })
  .del('/', OnlyOperation(Operations.manageQuestionTags), async (ctx, next) => {
    const { tagId } = ctx.params;
    await questionTagService.deleteQuestionTag(tagId);
    await next();
  });

module.exports = router;
