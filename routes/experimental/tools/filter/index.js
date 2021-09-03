const router = require('koa-router')();
const thread = require('./thread');
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const reviewSettings = await db.SettingModel.getSettings("review");
    data.groups = reviewSettings.keyword.wordGroup.map(w => {
      delete w.keywords;
      return w;
    });
    ctx.template = `experimental/tools/filter/filter.pug`;
    await next();
  })
  .post('/', async (ctx, next) => {
    const {state, body, data, db, nkcModules} = ctx;
    const {checkNumber} = nkcModules.checkData;
    const {
      groups,
      markAsUnReviewed,
      timeLimit,
      conditions,
      time,
      keywords = []
    } = body;
    const reviewSettings = await db.SettingModel.getSettings('review');
    const wordGroup = reviewSettings.keyword.wordGroup;
    const wordGroupObj = {};
    for(const wg of wordGroup) {
      wordGroupObj[wg.id] = wg;
    }

    const selectGroups = [];

    for(const g of groups) {
      const {count, times, logic} = g.conditions;
      const wg = wordGroupObj[g.id];
      if(!wg) ctx.throw(400, `分组 ID ${g.id} 不存在`);
      checkNumber(count, {
        name: `词组命中个数`,
        min: 1,
      });
      checkNumber(times, {
        name: `词组命中次数`,
        min: 1
      });
      if(!['and', 'or'].includes(logic)) {
        ctx.throw(400, `词组命中关系设置错误`);
      }
      selectGroups.push({
        id: wg.id,
        name: wg.name,
        keywords: wg.keywords,
        conditions: {
          count,
          times,
          logic
        }
      });
    }


    let startingTime;
    let endTime;
    if(timeLimit === 'custom') {
      startingTime = new Date(`${time[0]} 00:00:00`);
      endTime = new Date(`${time[1]} 00:00:00`);
    }
    if(keywords.length > 0) {
      checkNumber(conditions.count, {
        name: `自定义词组命中个数`,
        min: 1,
      });
      checkNumber(conditions.times, {
        name: `自定义词组命中次数`,
        min: 1
      });
      if(!['and', 'or'].includes(conditions.logic)) {
        ctx.throw(400, `自定义词组命中关系设置错误`);
      }
      selectGroups.push({
        id: 'custom',
        name: 'custom',
        keywords,
        conditions: {
          count: conditions.count,
          times: conditions.times,
          logic: conditions.logic
        }
      });
    }

    if(selectGroups.length === 0) {
      ctx.throw(400, `敏感词词组不能为空`);
    }
    const filterLog = db.FilterLogModel({
      type: 'post',
      operatorId: state.uid,
      groups: selectGroups,
      markUnReview: markAsUnReviewed,
      timeLimit: {
        type: timeLimit
      }
    });
    if(filterLog.timeLimit.type === 'custom') {
      filterLog.timeLimit.start = startingTime;
      filterLog.timeLimit.end = endTime;
    }
    await filterLog.save();

    thread({
      id: filterLog._id.toString(),
      groups: selectGroups,
      startingTime,
      endTime,
      markAsUnReviewed
    });

    await next();
  });
module.exports = router;