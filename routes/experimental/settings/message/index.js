const Router = require('koa-router');
const messageRouter = new Router();
messageRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const type = ctx.request.accepts('json', 'html');
    if(type !== 'json') {
      ctx.template = 'experimental/settings/message.pug';
      return await next();
    }
    data.roles = await db.RoleModel.find().sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({toc: 1});
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {body, db} = ctx;
    const {roles, grades} = body;
    await Promise.all(roles.map(async role => {
      await db.RoleModel.update({_id: role._id}, {
        $set: {
          messagePersonCountLimit: role.messagePersonCountLimit,
          messageCountLimit: role.messageCountLimit
        }
      })
    }));
    await Promise.all(grades.map(async grade => {
      await db.UsersGradeModel.update({_id: grade._id}, {
        $set: {
          messagePersonCountLimit: grade.messagePersonCountLimit,
          messageCountLimit: grade.messageCountLimit
        }
      })
    }));
    await next();
  });
module.exports = messageRouter;