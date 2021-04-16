const Router = require('koa-router');
const router = new Router();
router
  .get('/', async(ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page=0, t, c = ""} = query;
    data.t = t;
    data.c = c;
    const q = {};
    if(t === "username") {
      const tUser = await db.UserModel.findOne({usernameLowerCase: c.toLowerCase()});
      if(!tUser) {
        q.uid = "null";
      } else {
        q.$or = [
          {
            uid: tUser.uid
          },
          {
            shareUid: tUser.uid
          }
        ];
      }
    } else if(t === "uid") {
      q.$or = [
        {
          uid: c
        },
        {
          shareUid: c
        }
      ];
    } else if(t === "ip") {
      q.ip = c;
    } else if(t === "token") {
      q.code = c;
    }
    const count = await db.ShareLogsModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;
    const shareLogs = await db.ShareLogsModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.shareLogs = await Promise.all(shareLogs.map(async log => {
      log = log.toObject();
      if(log.uid)
        log.user = await db.UserModel.findOne({uid: log.uid});
      if(log.shareUid)
        log.shareUser = await db.UserModel.findOne({uid: log.shareUid});
      return log;
    }));
    ctx.template = 'experimental/log/share.pug';
    await next()
  });
module.exports = router;