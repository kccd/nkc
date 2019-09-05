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
    let uids = data.postSettings.c.postToForum.anonymous.uid.concat(data.postSettings.c.postToThread.anonymous.uid);
    uids = uids.concat(data.postSettings.c.postToForum.survey.uid, data.postSettings.c.postToThread.survey.uid);
    data.users = await db.UserModel.find({uid: {$in: uids}});
    data.roles = await db.RoleModel.find({_id: {$ne: "visitor"}}).sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({toc: 1});
    await next();
  })
  .patch('/', async (ctx, next) => {
    const {body, db} = ctx;
    const {roles, grades, postToThread, postToForum} = body;
    const q = {};
    if(postToForum) {
      const {exam} = postToForum;
      if(exam.notPass.status) {
        exam.volumeA = true;
        exam.volumeB = true;
      } else if(exam.volumeA) {
        exam.volumeB = true;
      }
      q['c.postToForum'] = postToForum;
    }
    if(postToThread) {
      const {exam} = postToThread;
      if(exam.notPass.status) {
        exam.volumeA = true;
        exam.volumeB = true;
      } else if(exam.volumeA) {
        exam.volumeB = true;
      }
      q['c.postToThread'] = postToThread;
    }
    await db.SettingModel.updateOne({_id: 'post'}, {$set: q});
    await Promise.all(roles.map(async role => {
      await db.RoleModel.update({_id: role._id}, {
        $set: {
          postToForum: role.postToForum,
          postToThread: role.postToThread,
        }
      })
    }));
    await Promise.all(grades.map(async grade => {
      await db.UsersGradeModel.update({_id: grade._id}, {
        $set: {
          postToForum: grade.postToForum,
          postToThread: grade.postToThread,
        }
      })
    }));
    await db.SettingModel.saveSettingsToRedis("post");
    await next();
  });

module.exports = router;