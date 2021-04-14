const Router = require('koa-router');
const router = new Router();
router
  .get('/editor', async (ctx, next) => {
    ctx.template = '/exam/editCategory.pug'
    const {data, db, query} = ctx;
    const {cid} = query;
    if(cid) {
      const category = await db.ExamsCategoryModel.findOnly({_id: Number(cid)});
      const {from} = category;
      for(const f of from) {
        const {type, fid} = f;
        if(type === 'pub') continue;
        f.forum = await db.ForumModel.findOnly({fid});
      }
      data.category = category;
    }
    data.roles = await db.RoleModel.find({type: 'common'});
    const from = [];
    const pubQ = {
      disabled: false,
      auth: true,
      public: true,
      volume: 'A'
    }
    const pubCountA = await db.QuestionModel.countDocuments(pubQ);
    pubQ.volume = 'B';
    const pubCountB = await db.QuestionModel.countDocuments(pubQ);
    const obj = {
      type: 'pub'
    }
    obj.countA = pubCountA;
    obj.countB = pubCountB;
    if(pubCountA !== 0 || pubCountB !== 0) {
      from.push(obj);
    }
    const fids = await db.QuestionModel.distinct('fid');
    for(const fid of fids) {
      if([null, ''].includes(fid)) continue;
      const forum = await db.ForumModel.findOnly({fid});
      const obj = {
        type: 'pro',
        forum,
        fid
      }
      const q = {
        disabled: false,
        auth: true,
        public: false,
        volume: 'A',
        fid
      };
      const countA = await db.QuestionModel.countDocuments(q);
      obj.countA = countA;
      q.volume = 'B';
      const countB = await db.QuestionModel.countDocuments(q);
      obj.countB = countB;
      if(countA === 0 && countB === 0) continue;
      from.push(obj);
    }
    data.from = from;
    data.categories = await db.ExamsCategoryModel.find();
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db, body, tools} = ctx;
    const {user} = data;
    const {contentLength} = tools.checkString;
    const {category} = body;
    let {
      name,
      description,
      from,
      volume,
      rolesId,
      passScore,
      time,
      disabled
    } = category;
    if(!name) ctx.throw(400, '考卷名不能为空')
    if(contentLength(name) > 50) ctx.throw(400, '考卷名称字数不能大于50');
    if(!description) ctx.throw(400, '考卷介绍不能为空');
    if(contentLength(description) > 500) ctx.throw(400, '考卷介绍字数不能大于500');
    if(!['A', 'B'].includes(volume)) ctx.throw(400, '请选择试卷难度');
    if(!rolesId) rolesId = [];
    if(rolesId.length !== 0) {
      const roles = await db.RoleModel.find({_id: {$in: rolesId}, defaultRole: false});
      rolesId = roles.map(r => r._id);
    }
    if(!from) from === [];
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
      disabled
    });
    await c.save();
    await next();
  });
module.exports = router;
