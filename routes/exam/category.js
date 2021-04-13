const Router = require('koa-router');
const categoryRouter = new Router();
categoryRouter
  .put('/:_id', async (ctx, next) => {
    const {data, db, body, tools, params} = ctx;
    const {_id} = params;
    const categoryDB = await db.ExamsCategoryModel.findOnly({_id});
    const {volume} = categoryDB;
    const {user} = data;
    const {contentLength} = tools.checkString;
    const {category} = body;
    let {
      name,
      description,
      from = [],
      rolesId,
      passScore,
      time,
      disabled
    } = category;
    if(!name) ctx.throw(400, '考卷名不能为空');
    if(contentLength(name) > 50) ctx.throw(400, '考卷名称字数不能大于50');
    if(!description) ctx.throw(400, '考卷介绍不能为空');
    if(contentLength(description) > 500) ctx.throw(400, '考卷介绍字数不能大于500');
    if(!rolesId) rolesId = [];
    if(rolesId.length !== 0) {
      const roles = await db.RoleModel.find({_id: {$in: rolesId}, defaultRole: false});
      rolesId = roles.map(r => r._id);
    }
    let questionsCount = 0;
    if(from.length !== 0) {
      for(const f of from) {
        const {fid, count, type} = f;
        delete f.countA;
        delete f.countB;
        questionsCount += count;
        if(type === 'pub') {
          const pubCount = await db.QuestionModel.countDocuments({
            disabled: false,
            auth: true,
            public: true,
            volume
          });
          if(count > pubCount) ctx.throw(400, '公共题库试题数目不足，请刷新');
        } else {
          const questionCount = await db.QuestionModel.countDocuments({
            disabled: false,
            auth: true,
            volume,
            public: false,
            fid
          });
          if(count > questionCount) {
            const forum = await db.ForumModel.findOnly({fid});
            ctx.throw(400, `${forum.displayName}题库数量不足，请刷新`);
          }
        }
      }
    }
    if(category.passScore < 1 || category.passScore > questionsCount) ctx.throw('及格分数不能大于试题总数且不能小于1');
    if(category.time <= 0) ctx.throw(400, '答题时间必须大于0分钟');
    category.disabled = !!category.disabled;
    const q = {
      from,
      uid: user.uid,
      name,
      description,
      rolesId,
      passScore,
      time,
      disabled
    };
    await categoryDB.updateOne(q);
    await next();
  });
module.exports = categoryRouter;
