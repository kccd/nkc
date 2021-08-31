const router = require('koa-router')();
const thread = require('./thread');
router
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const reviewSettings = await db.SettingModel.getSettings("review");
    data.groups = reviewSettings.keyword.wordGroup;
    ctx.template = `experimental/tools/filter/filter.pug`;
    await next();
  })
  .post('/', async (ctx, next) => {
    const {state, body, data, db, nkcModules} = ctx;
    const {checkNumber} = nkcModules.checkData;
    const {
      groupsId,
      markAsUnReviewed,
      timeLimit,
      condition,
      time,
      keywords = []
    } = body;
    const reviewSettings = await db.SettingModel.getSettings('review');
    const groups = reviewSettings.keyword.wordGroup;
    const selectGroupsId = [];
    const selectGroups = groups.filter(g => {
      if(groupsId.includes(g.id)) {
        selectGroupsId.push(g.id);
        return true;
      } else {
        return false;
      }
    });
    let startingTime;
    let endTime;
    if(timeLimit === 'custom') {
      startingTime = new Date(`${time[0]} 00:00:00`);
      endTime = new Date(`${time[1]} 00:00:00`);
    }
    if(keywords.length > 0) {
      checkNumber(condition.count, {
        name: `自定义词组命中个数`,
        min: 1,
      });
      checkNumber(condition.times, {
        name: `自定义词组命中次数`,
        min: 1
      });
      if(!['and', 'or'].includes(condition.logic)) {
        ctx.throw(400, `自定义词组命中关系设置错误`);
      }
      selectGroups.push({
        id: 'custom',
        name: 'custom',
        keywords,
        conditions: condition
      });
    }

    if(selectGroups.length === 0) {
      ctx.throw(400, `敏感词词组不能为空`);
    }
    const filterLog = db.FilterLogModel({
      type: 'post',
      operatorId: state.uid,
      groupsId: selectGroupsId,
      keywords: {
        content: keywords
      },
      markUnReview: markAsUnReviewed,
      timeLimit: {
        type: timeLimit
      }
    });
    if(filterLog.keywords.content.length > 0) {
      filterLog.keywords.count = condition.count;
      filterLog.keywords.times = condition.times;
      filterLog.keywords.logic = condition.logic;
    }
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