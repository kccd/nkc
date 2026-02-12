const router = require('koa-router')();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
const { ipFinderService } = require('../../services/ip/ipFinder.service');
router.get(
  '/',
  OnlyOperation(Operations.getUserOtherAccount),
  async (ctx, next) => {
    const { data, db, query } = ctx;
    const { targetUser } = data;
    const { page = 0 } = query;
    let ipsData = await db.UsersBehaviorModel.aggregate([
      {
        $match: {
          uid: targetUser.uid,
          ip: {
            $nin: ['127.0.0.1', '0.0.0.0', '::ffff:127.0.0.1'],
          },
        },
      },
      {
        $group: {
          _id: '$ip',
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);
    const ips = [];
    for (const i of ipsData) {
      const ipInfo = await ipFinderService.getIpInfo(i._id);
      ips.push(i._id);
      i.ip = i._id;
      delete i._id;
      i.location = `${ipInfo.country} ${ipInfo.region} ${ipInfo.city}`;
    }
    data.ips = ipsData;
    let otherUid = await db.UsersBehaviorModel.aggregate([
      {
        $match: {
          uid: { $nin: ['visitor', targetUser.uid] },
          ip: { $in: ips },
        },
      },
      {
        $group: {
          _id: '$uid',
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);
    const usersId = otherUid.map((u) => u._id);
    const users = await db.UserModel.find(
      { uid: usersId },
      { uid: 1, avatar: 1, username: 1, certs: 1 },
    ).sort({ toc: 1 });
    data.accounts = await Promise.all(
      users.map(async (user) => {
        const r = await db.UsersBehaviorModel.aggregate([
          {
            $match: {
              uid: user.uid,
              ip: { $in: ips },
            },
          },
          {
            $group: {
              _id: '$ip',
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              count: -1,
            },
          },
        ]);
        const ipMap = await ipFinderService.getIPInfoMapByIPs(
          r.map((a) => a._id),
        );
        return {
          user: {
            uid: user.uid,
            avatar: user.avatar,
            username: user.username,
            banned: user.certs.includes('banned'),
          },
          ips: await Promise.all(
            r.map(async (a) => {
              const ipInfo = ipMap.get(a._id);
              return {
                ip: a._id,
                location: `${ipInfo.country} ${ipInfo.region} ${ipInfo.city}`,
                count: a.count,
              };
            }),
          ),
        };
      }),
    );
    ctx.template = 'user/alt/alt.pug';
    await next();
  },
);
module.exports = router;
