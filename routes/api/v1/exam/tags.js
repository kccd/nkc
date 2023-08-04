const router = require('koa-router')();
const {
  questionTagService,
} = require('../../../../services/exam/questionTag.service');
const { OnlyPermission } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations.js');
const { DynamicOperations } = require('../../../../settings/operations');
router
  .get('/', async (ctx, next) => {
    const tags = await questionTagService.getAllTag();
    ctx.apiData = {
      tags,
      manageQuestionTagsPermission: ctx.permission(
        DynamicOperations.manageQuestionTags,
      ),
    };
    await next();
  })
  .post(
    '/',
    OnlyPermission(Operations.manageQuestionTags),
    async (ctx, next) => {
      const { body } = ctx;
      const { name, desc } = body.tag;
      await questionTagService.checkNameDescFormat(name, desc);
      await questionTagService.checkTagName(name);
      const tag = await questionTagService.createQuestionTag({
        name,
        desc,
      });
      ctx.apiData = {
        tag: {
          _id: tag._id,
          toc: tag.toc,
          name: tag.name,
          desc: tag.desc,
        },
      };
      await next();
    },
  );
module.exports = router;
