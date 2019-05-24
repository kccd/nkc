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
    const {roles, grades, type, messageType} = body;
    if(type === "modifyMessageType") {
      const {templates, _id, name, description} = messageType;
      if(!name) ctx.throw(400, "类型名不能为空");
      if(!description) ctx.throw(400, "类型简介不能为空");
      for(const template of templates) {
        const {type, content} = template;
        if(!content) ctx.throw(400, "模板内容不能为空");
        await db.MessageTypeModel.updateOne({
          _id,
          "templates.type": type
        }, {
          $set: {
            "templates.$.content": content,
            name,
            description
          }
        });
      }
    } else if(type === "modifySendLimit") {
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
    }
    await next();
  });
module.exports = messageRouter;