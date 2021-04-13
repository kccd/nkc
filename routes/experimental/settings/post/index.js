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
    data.librarySettings = await db.SettingModel.getSettings("library");
    data.postSettings.c.postLibrary = data.librarySettings;
    let uids = data.postSettings.c.postToForum.anonymous.uid.concat(data.postSettings.c.postToThread.anonymous.uid);
    uids = uids.concat(data.postSettings.c.postToForum.survey.uid, data.postSettings.c.postToThread.survey.uid);
    data.users = await db.UserModel.find({uid: {$in: uids}});
    data.roles = await db.RoleModel.find({_id: {$ne: "visitor"}}).sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({toc: 1});
    await next();
  })
  .put('/', async (ctx, next) => {
    const {body, db, nkcModules} = ctx;
    const {roles, grades, postToThread, postToForum, postLibrary} = body;
    const q = {};
    const {checkNumber} = nkcModules.checkData;
    if(postToForum || postToThread) {
      if(postToForum) {
        const {exam, originalWordLimit, minorForumCount} = postToForum;
        if(exam.notPass.status) {
          exam.volumeA = true;
          exam.volumeB = true;
        } else if(exam.volumeA) {
          exam.volumeB = true;
        }
        checkNumber(originalWordLimit, {
          name: "原创声明内容最小字数",
          min: 0
        });
        const {min, max} = minorForumCount;
        checkNumber(min, {
          name: '辅助专业最小数量',
          min: 0,
        });
        checkNumber(max, {
          name: '辅助专业最大数量',
          min: 0
        });
        if(max < min) ctx.throw(400, `辅助专业数量设置错误`);
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
        await db.RoleModel.updateOne({_id: role._id}, {
          $set: {
            postToForum: role.postToForum,
            postToThread: role.postToThread,
          }
        })
      }));
      await Promise.all(grades.map(async grade => {
        await db.UsersGradeModel.updateOne({_id: grade._id}, {
          $set: {
            postToForum: grade.postToForum,
            postToThread: grade.postToThread,
          }
        })
      }));
      await db.SettingModel.saveSettingsToRedis("post");
    } else if(postLibrary) {
      const {exam} = postLibrary;
      if(exam.notPass.status) {
        exam.volumeA = true;
        exam.volumeB = true;
      } else if(exam.volumeA) {
        exam.volumeB = true;
      }
      q.c = postLibrary;
      await db.SettingModel.updateOne({_id: 'library'}, {$set: q});
      await db.SettingModel.saveSettingsToRedis("library");
    }
    await next();
  });

module.exports = router;
