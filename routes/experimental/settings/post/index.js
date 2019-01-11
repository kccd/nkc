const Router = require('koa-router');
const router = new Router();

router
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const from = ctx.request.get('FROM');
    if(from !== 'nkcAPI') {
      ctx.template = 'experimental/settings/post.pug';
      return await next();
    }
    data.postSettings = await db.SettingModel.findOnly({_id: 'post'});
    data.roles = await db.RoleModel.find().sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({toc: 1});
    await next();
  })
  .patch('/', async (ctx, next) => {
    // 等待考试设置，设置考试试卷数量
    const {body, db} = ctx;
    const {roles, grades, postToThread, postToForum} = body;
    if(postToForum) {
      await db.SettingModel.updateOne({_id: 'post', 'c.postToForum': postToForum});
    }
    if(postToThread) {
      await db.SettingModel.updateOne({_id: 'post', 'c.postToThread': postToThread});
    }
    await Promise.all(roles.map(async role => {
      await db.RoleModel.update({_id: role._id}, {
        $set: {
          postToForumCountLimit: role.postToForumCountLimit,
          postToThreadCountLimit: role.postToThreadCountLimit,
          postToForumTimeLimit: role.postToForumTimeLimit,
          postToThreadTimeLimit: role.postToThreadTimeLimit
        }
      })
    }));
    await Promise.all(grades.map(async grade => {
      await db.UsersGradeModel.update({_id: grade._id}, {
        $set: {
          postToForumCountLimit: grade.postToForumCountLimit,
          postToThreadCountLimit: grade.postToThreadCountLimit,
          postToForumTimeLimit: grade.postToForumTimeLimit,
          postToThreadTimeLimit: grade.postToThreadTimeLimit
        }
      })
    }));
    await next();
  });

module.exports = router;