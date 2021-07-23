const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, query, data, nkcModules} = ctx;
    const {page = 0} = query;
    const count = await db.FundBlacklistModel.countDocuments({});
    const paging = nkcModules.apiFunction.paging(page, count);
    const list = await db.FundBlacklistModel.find({}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.list = [];
    const usersId = [];
    const usersObj = {};
    const applicationFormsId = [];
    const applicationFormsObj = {};
    for(const l of list) {
      usersId.push(l.uid);
      usersId.push(l.operatorUid);
      applicationFormsId.push(l.applicationFormId);
    }
    const users = await db.UserModel.find({uid: {$in: usersId}}, {uid: 1, username: 1, avatar: 1});
    users.map(u => usersObj[u.uid] = u);
    const applicationForms = await db.FundApplicationFormModel.find({_id: {$in: applicationFormsId}}, {code: 1, _id: 1});
    applicationForms.map(a => applicationFormsObj[a._id] = a);
    for(const l of list) {
      const {
        toc,
        uid,
        reason,
        operatorUid,
        applicationFormId
      } = l;
      const u = usersObj[uid];
      const operator = usersObj[operatorUid];
      const applicationForm = applicationFormId? applicationFormsObj[applicationFormId]: null;
      data.list.push({
        toc,
        user: u,
        reason,
        operator,
        applicationForm
      });
    }
    data.paging = paging;
    ctx.template = 'fund/blacklist/blacklist.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, body, state} = ctx;
    const {uid, applicationFormId, reason} = body;
    const targetUser = await db.UserModel.findOnly({uid});
    const applicationForm = await db.FundApplicationFormModel.findOnly({_id: applicationFormId});
    await db.FundBlacklistModel.addUserToBlacklist({
      uid: targetUser.uid,
      reason,
      operatorUid: state.uid,
      applicationFormId: applicationForm,
      fundId: applicationForm.fundId
    });
    await next();
  })
  .del('/', async (ctx, next) => {
    const {db, query} = ctx;
    await db.FundBlacklistModel.removeUserFromBlacklist(query.uid);
    await next();
  });
module.exports = router;