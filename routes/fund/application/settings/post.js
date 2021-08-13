const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, body, data, query, state, nkcModules} = ctx;
    const {page = 0, type, content} = query;
    const {applicationForm} = data;
    const recycleId = await db.SettingModel.getRecycleId();
    const filter = {
      pid: 1,
      tid: 1,
      t: 1,
    };
    let match;
    if(type === 'self') {
      match = {
        uid: applicationForm.uid,
        type: 'thread',
        disabled: false,
        mainForumsId: {$ne: recycleId}
      };
    } else if(type === 'search') {
      if(!content) ctx.throw(400, `搜索关键词不能为空`);
      const members = await db.FundApplicationUserModel.find({
        applicationFormId: applicationForm._id,
        $or: [
          {
            type: 'applicant'
          },
          {
            type: 'member',
            removed: false,
            agree: true,
          }
        ]
      }, {uid: 1});
      const membersId = members.map(m => m.uid);
      match = {
        uid: {$in: membersId},
        $or: [
          {
            pid: content
          },
          {
            t: new RegExp(`${content}`, "gi")
          }
        ]
      };
    }
    const count = await db.PostModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const posts = await db.PostModel.find(match, filter).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.paging = paging;
    data.posts = posts;
    await next();
  });
module.exports = router;