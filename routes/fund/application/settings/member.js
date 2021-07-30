const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {db, body, data, state} = ctx;
    const {applicationForm} = data;
    const usersId = new Set(body.usersId);
    usersId.delete(state.uid);
    const now = new Date();
    for(const uid of usersId) {
      let member = await db.FundApplicationUserModel.findOne({
        applicationFormId: applicationForm._id,
        type: 'member',
        uid,
        removed: false,
      });
      if(!member) {
        await db.FundApplicationUserModel.checkPermissionToBeAMember(uid);
        member = db.FundApplicationUserModel({
          toc: now,
          applicationFormId: applicationForm._id,
          type: 'member',
          uid,
          agree: null,
        });
        await member.save();
      } else if(member.agree === false) {
        member.toc = now;
        member.agree = null;
        await member.save();
      }
    }
    await next();
  })
  .del('/', async (ctx, next) => {
    const {db, query, data} = ctx;
    const {applicationForm} = data;
    const {uid} = query;
    await db.FundApplicationUserModel.updateMany({
      uid,
      applicationFormId: applicationForm._id
    }, {
      $set: {
        removed: true
      }
    }).sort({toc: -1});
    await next();
  })
  .use('/', async (ctx, next) => {
    const {db, data, state} = ctx;
    const {applicationForm} = data;
    data.members = await db.FundApplicationUserModel.find({
      applicationFormId: applicationForm._id,
      uid: {$ne: state.uid},
      removed: false,
    }).sort({toc: 1});
    await next();
  })
module.exports = router;