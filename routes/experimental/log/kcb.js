const Router = require('koa-router');
const kcbRouter = new Router();
kcbRouter
  .get('/', async (ctx, next) => {
    const {nkcModules, data, db, query} = ctx;
    const {page = 0, t, content} = query;
    const q = {};
    if(t === 'username') {
      const u = await db.UserModel.findOne({usernameLowerCase: content.toLowerCase()});
      if(u) {
        q.$or = [
          {
            from: u.uid
          },
          {
            to: u.uid
          }
        ];
      } else {
        data.info = '用户名不存在';
      }
    } else if(t === 'uid') {
      q.$or = [
        {
          from: content
        },
        {
          to: content
        }
      ];
    } else if(t === 'ip') {
      q.ip = content;
    }
    const count = await db.KcbsRecordModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const kcbsRecords = await db.KcbsRecordModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.kcbsRecords = await db.KcbsRecordModel.extendKcbsRecords(kcbsRecords);
    for(const record of data.kcbsRecords) {
      record.typeInfo = ctx.state.lang("kcbsTypes", record.type);
    }
    data.kcbSettings = (await db.SettingModel.findOnly({_id: 'kcb'})).c;
    data.paging = paging;
    data.t = t;
    data.content = content;
    ctx.template = 'experimental/log/kcb.pug';
    await next();
  });
module.exports = kcbRouter;