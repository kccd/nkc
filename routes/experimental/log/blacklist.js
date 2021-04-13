const router = require("koa-router")();
router
  .get('/', async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page = 0, t} = query;
    data.t = t;
    if(!t) {
      const count = await db.BlacklistModel.countDocuments();
      const paging = nkcModules.apiFunction.paging(page, count);
      const bl = await db.BlacklistModel.find().sort({toc: -1}).skip(paging.start).limit(paging.perpage);
      const usersId = [];
      for(const b of bl) {
        usersId.push(b.uid);
        usersId.push(b.tUid);
      }
      const users = await db.UserModel.find({uid: {$in: usersId}});
      const usersObj = {};
      for(const u of users) {
        usersObj[u.uid] = u;
      }
      data.bl = [];
      for(const b of bl) {
        const {uid, tUid, from, pid, toc, _id} = b;
        const u = usersObj[uid];
        const tu = usersObj[tUid];
        data.bl.push({
          toc,
          user: u,
          tUser: tu,
          from,
          pid,
          _id
        });
      }
      data.paging = paging;
    } else {
      const result = await db.BlacklistModel.aggregate([
        {
          $group: {
            _id: `$${t}`,
            count: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            count: -1
          }
        },
        {
          $limit: 200
        }
      ]);
      const usersId = [];
      for(const r of result) {
        usersId.push(r._id);
      }
      const users = await db.UserModel.find({uid: {$in: usersId}});
      const usersObj = {};
      for(const u of users) {
        usersObj[u.uid] = u;
      }
      data.bl = [];
      for(const r of result) {
        const u = usersObj[r._id];
        data.bl.push({
          user: u,
          count: r.count
        });
      }
    }
    ctx.template = 'experimental/log/blacklist.pug';
    await next();
  });
module.exports = router;
