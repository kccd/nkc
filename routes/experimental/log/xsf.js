const Router = require('koa-router');
const xsfRouter = new Router();
xsfRouter
  .get('/', async (ctx, next) => {
    const {data, query, db, nkcModules} = ctx;
    let {page = 0, t = '', content = ''} = query;
    t = t.trim();
    content = content.trim();
    const q = {};
    if(t === 'username') {
      const u = await db.UserModel.findOne({usernameLowerCase: content.toLowerCase()});
      if(!u) {
        data.info = '用户名不存在';
      } else {
        q.$or = [
          {
            uid: u.uid
          },
          {
            operatorId: u.uid
          }
        ];
      }
    } else if(t === 'ip') {
      q.ip = content;
    } else if(t === 'uid') {
      q.$or = [
        {
          uid: content
        },
        {
          operatorId: content
        }
      ]
    }
    const count = await db.XsfsRecordModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const xsfsRecords = await db.XsfsRecordModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.xsfsRecords = await db.XsfsRecordModel.extendXsfsRecords(xsfsRecords);
    data.paging = paging;
    data.t = t;
    data.content = content;
    ctx.template = 'experimental/log/xsf.pug';
    await next();
  });
module.exports = xsfRouter;
