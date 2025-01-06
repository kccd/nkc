const Router = require('koa-router');
const { paperService } = require('../../services/exam/paper.service');
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
const categoryRouter = new Router();
categoryRouter.put(
  '/:_id',
  OnlyOperation(Operations.modifyExamsCategory),
  async (ctx, next) => {
    const { data, db, body, tools, params } = ctx;
    const { _id } = params;
    const categoryDB = await db.ExamsCategoryModel.findOnly({ _id });
    const { volume } = categoryDB;
    const { user } = data;
    const { contentLength } = tools.checkString;
    const { category } = body;
    let {
      name,
      description,
      from = [],
      rolesId,
      passScore,
      time,
      disabled,
      type,
    } = category;
    if (!name) {
      ctx.throw(400, '考卷名不能为空');
    } else if (contentLength(name) > 50) {
      ctx.throw(400, '考卷名称字数不能大于50');
    } else if (!description) {
      ctx.throw(400, '考卷介绍不能为空');
    } else if (contentLength(description) > 500) {
      ctx.throw(400, '考卷介绍字数不能大于500');
    } else if (!rolesId) {
      rolesId = [];
    } else if (rolesId.length !== 0) {
      const roles = await db.RoleModel.find({
        _id: { $in: rolesId },
        defaultRole: false,
      });
      rolesId = roles.map((r) => r._id);
    }

    const condition = {
      volume,
      auth: true,
      disabled: false,
    };
    let questionsCount = 0;
    if (from.length !== 0) {
      //检测题库题数是否满足
      await paperService.canTakeQuestionNumbers(from, condition);
      for (const f of from) {
        const { count } = f;
        questionsCount += count;
      }
    }

    if (passScore < 1 || passScore > questionsCount) {
      ctx.throw('及格分数不能大于试题总数且不能小于1');
    }
    if (time <= 0) {
      ctx.throw(400, '答题时间必须大于0分钟');
    }
    category.disabled = !!category.disabled;
    const q = {
      from,
      uid: user.uid,
      name,
      description,
      rolesId,
      passScore,
      time,
      disabled,
      type,
    };
    await categoryDB.updateOne(q);
    await next();
  },
);
module.exports = categoryRouter;
