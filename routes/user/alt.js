const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {targetUser} = data;
    let ips = await db.UsersBehaviorModel.aggregate([
      {
        $match: {
          uid: targetUser.uid,
          ip: {
            $nin: [
              '127.0.0.1',
              '0.0.0.0',
              '::ffff:127.0.0.1'
            ]
          }
        }
      },
      {
        $group: {
          _id: '$ip',
          count: {
            $sum: 1
          }
        }
      }
    ]);
    ips = ips.map(i => i._id);
    let otherUid = await db.UsersBehaviorModel.aggregate([
      {
        $match: {
          uid: {$ne: 'visitor'},
          ip: {$in: ips}
        }
      },
      {
        $group: {
          _id: '$uid'
        }
      }
    ]);
    const usersId = otherUid.map(u => u._id);
    const users = await db.UserModel.find({uid: usersId});
    const usersObj = {};
    users.map(u => usersObj[u.uid] = u);
    await next();
  });
module.exports = router;
