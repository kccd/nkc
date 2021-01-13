const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    const {targetUser} = data;
    const {page = 0} = query;
    let ipsData = await db.UsersBehaviorModel.aggregate([
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
      },
      {
        $sort: {
          count: -1
        }
      }
    ]);
    const ips = [];
    for(const i of ipsData) {
      const ipInfo = await db.IPModel.getIPInfoFromLocal(i._id);
      ips.push(i._id);
      i.ip = i._id;
      delete i._id;
      i.location = ipInfo.location;
    }
    data.ips = ipsData;
    let otherUid = await db.UsersBehaviorModel.aggregate([
      {
        $match: {
          uid: {$nin: ['visitor', targetUser.uid]},
          ip: {$in: ips}
        }
      },
      {
        $group: {
          _id: '$uid',
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          count: -1
        }
      }
    ]);
    const usersId = otherUid.map(u => u._id);
    const users = await db.UserModel.find({uid: usersId}).sort({toc: 1});
     data.accounts = await Promise.all(users.map(async user =>{
      const r = await db.UsersBehaviorModel.aggregate([
        {
          $match: {
            uid: user.uid,
            ip: {$in: ips}
          }
        },
        {
          $group: {
            _id: '$ip',
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        }
      ]);
      return {
        user: {
          uid: user.uid,
          avatar: user.avatar,
          username: user.username
        },
        ips: await Promise.all(r.map(async a => {
          const ipInfo = await db.IPModel.getIPInfoFromLocal(a._id);
          return {
            ip: a._id,
            location: ipInfo.location,
            count: a.count
          }
        }))
      };
    }));
    ctx.template = 'user/alt/alt.pug';
    await next();
  });
module.exports = router;
