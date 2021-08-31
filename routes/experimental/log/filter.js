const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {nkcModules, db, data, query} = ctx;
    const {page = 0} = query;
    const count = await db.FilterLogModel.countDocuments();
    const paging = nkcModules.apiFunction.paging(page, count);
    const filterLogs = await db.FilterLogModel.find({})
      .sort({toc: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    const reviewSettings = await db.SettingModel.getSettings('review');
    const {wordGroup} = reviewSettings.keyword;
    const groupsObj = {};
    for(const g of wordGroup) {
      groupsObj[g.id] = g;
    }
    const usersId = filterLogs.map(f => f.operatorId);
    const usersObj = await db.UserModel.getUsersObjectByUsersId(usersId);
    data.filterLogs = [];
    for(let filterLog of filterLogs) {
      filterLog = filterLog.toObject();
      filterLog.operator = usersObj[filterLog.operatorId];
      filterLog.groups = filterLog.groupsId.map(id => {
        const group = groupsObj[id];
        return group? group.name: `${id}(已删除)`;
      });
      data.filterLogs.push(filterLog);
    }
    data.paging = paging;
    ctx.template = 'experimental/log/filter.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {body, db} = ctx;
    const {filterLogId, markUnReview} = body;
    const filterLog = await db.FilterLogModel.findOnly({_id: filterLogId});
    const {targetId} = filterLog.result;
    await db.PostModel.updateMany({
      pid: {$in: targetId},
      reviewed: markUnReview
    }, {
      $set: {
        reviewed: !markUnReview
      }
    });
    await db.ThreadModel.updateMany({
      oc: {$in: targetId},
      reviewed: markUnReview
    }, {
      $set: {
        reviewed: !markUnReview
      }
    });
    await filterLog.updateOne({
      $set: {
        markUnReview
      }
    });
    await next();
  });
module.exports = router;