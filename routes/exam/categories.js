const Router = require('koa-router');
const { questionService } = require('../../services/exam/question.service');
const router = new Router();
router
  .get('/editor', async (ctx, next) => {
    ctx.template = 'exam/editCategory.pug';
    const { data, db, query } = ctx;
    const { cid } = query;
    const allTag = await db.QuestionTagModel.find({}, { name: 1 }).lean();
    if (cid) {
      const { from, volume, ...rest } = await db.ExamsCategoryModel.findOne({
        _id: Number(cid),
      }).lean();
      const newFrom = from.map((item) => {
        const tag = allTag.find((t) => t._id === item.tag);
        if (tag) {
          return {
            count: item.count,
            _id: item.tag,
            name: tag.name,
            volume,
          };
        }
      });
      data.category = { ...rest, from: newFrom, volume };
    }
    data.roles = await db.RoleModel.find({ type: 'common' });
    const tagQ = {
      volume: 'A',
      auth: true,
      disabled: false,
    };
    const processTagData = async (tagQ) => {
      const tagPipelines = [
        {
          $match: tagQ,
        },
        {
          $unwind: '$tags',
        },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 },
            volume: { $first: '$volume' }, // 通过 $first 操作获取 volume 字段的值
          },
        },
      ];
      const tagData = await db.QuestionModel.aggregate(tagPipelines);
      tagData.forEach((item) => {
        const matchedTag = allTag.find((tag) => tag._id === item._id);
        if (matchedTag) {
          item.name = matchedTag.name;
        }
      });
      return tagData;
    };
    const tagA = await processTagData(tagQ);
    tagQ.volume = 'B';
    const tagB = await processTagData(tagQ);
    data.tag = { tagA, tagB };
    data.categories = await db.ExamsCategoryModel.find();
    await next();
  })
  .post('/', async (ctx, next) => {
    const { data, db, body, tools } = ctx;
    const { user } = data;
    const { contentLength } = tools.checkString;
    const { category } = body;
    let {
      name,
      description,
      from,
      volume,
      rolesId,
      passScore,
      time,
      disabled,
    } = category;
    if (!name) {
      ctx.throw(400, '考卷名不能为空');
    } else if (contentLength(name) > 50) {
      ctx.throw(400, '考卷名称字数不能大于50');
    } else if (!description) {
      ctx.throw(400, '考卷介绍不能为空');
    } else if (contentLength(description) > 500) {
      ctx.throw(400, '考卷介绍字数不能大于500');
    } else if (!['A', 'B'].includes(volume)) {
      ctx.throw(400, '请选择试卷难度');
    } else if (!rolesId) {
      rolesId = [];
    } else if (rolesId.length !== 0) {
      const roles = await db.RoleModel.find({
        _id: { $in: rolesId },
        defaultRole: false,
      });
      rolesId = roles.map((r) => r._id);
    } else if (!from) {
      from === [];
    }
    let questionsCount = 0;
    const condition = {
      volume,
      auth: true,
      disabled: false,
    };
    if (from.length !== 0) {
      //检测题库题数是否满足
      await questionService.canTakeQuestionNumbers(from, condition);
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
    const c = db.ExamsCategoryModel({
      _id: await db.SettingModel.operateSystemID('examsCategories', 1),
      from,
      uid: user.uid,
      name,
      description,
      volume,
      rolesId,
      passScore,
      time,
      disabled,
    });
    await c.save();
    await next();
  });
module.exports = router;
