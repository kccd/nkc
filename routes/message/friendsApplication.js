const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {firstMessageId} = query;
    const {user} = data;
    const q = {
      respondentId: user.uid
    };
    if(firstMessageId) {
      q._id = {
        $lt: firstMessageId
      }
    }
    const friendsApplications = await db.FriendsApplicationModel.find(q).sort({toc: -1}).limit(30);
    const applications = [];
    for(const f of friendsApplications) {
      const targetUser = await db.UserModel.findOne({uid: f.applicantId});
      if(!targetUser) return;
      applications.push({
        _id: f._id,
        username: targetUser.username,
        description: f.description,
        uid: targetUser.uid,
        toc: f.toc,
        agree: f.agree,
        tlm: f.tlm
      });
    }
    data.messages = applications.reverse();
    await next();
  });
module.exports = router;