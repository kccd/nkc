const Router = require('koa-router');
const router = new Router();
const {
  questionTagService,
} = require('../../services/exam/questionTag.service');
const { questionService } = require('../../services/exam/question.service');
const { DynamicOperations, Operations } = require('../../settings/operations');
const { OnlyOperation } = require('../../middlewares/permission');
router.get(
  '/',
  OnlyOperation(Operations.visitExamQuestionManagement),
  async (ctx, next) => {
    const { nkcModules, query, db, data } = ctx;
    let { t, fid, page = 0, v } = query;
    const q = {};
    if (['A', 'B'].includes(v)) {
      q.volume = v;
      data.v = v;
    }
    data.t = t;
    if (t === 'un') {
      q.auth = false;
    } else if (t === 'waiting') {
      q.auth = null;
    } else {
      if (fid) {
        fid = Number(fid);
        q.tags = fid;
        data.fid = fid;
      }
    }
    const count = await db.QuestionModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const questions = await db.QuestionModel.find(q)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    data.questions = await questionService.extendQuestions(questions);
    const tags = await questionTagService.getAllTag();
    data.tags = [];
    let targetTag = null;
    for (const tag of tags) {
      const count = await db.QuestionModel.countDocuments({
        tags: tag._id,
        disabled: false,
        auth: true,
      });
      const allCount = await db.QuestionModel.countDocuments({
        tags: tag._id,
      });
      const newTag = {
        tagName: tag.name,
        tagDesc: tag.desc,
        tagId: tag._id,
        count,
        allCount,
      };
      if (fid === tag._id) {
        targetTag = newTag;
      }
      data.tags.push(newTag);
    }
    data.targetTag = targetTag;
    data.paging = paging;
    data.allCount = await db.QuestionModel.countDocuments();
    data.count = await db.QuestionModel.countDocuments({
      disabled: false,
      auth: true,
    });
    data.unCount = await db.QuestionModel.countDocuments({ auth: false });
    data.waitingCount = await db.QuestionModel.countDocuments({ auth: null });
    data.manageQuestionTagsPermission = ctx.permission(
      DynamicOperations.manageQuestionTags,
    );
    ctx.template = 'exam/question/questions.pug';
    await next();
  },
);
module.exports = router;
