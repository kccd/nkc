const Router = require('koa-router');
const messageRouter = new Router();
messageRouter
  .get('/', async (ctx, next) => {
    const {data, db, state} = ctx;
    data.messageTypes = await db.MessageTypeModel.find();
    data.messageTypesLanguage = state.language.messageTypes;
    data.roles = await db.RoleModel.find().sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({toc: 1});
    ctx.template = 'experimental/settings/message/message.pug';
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