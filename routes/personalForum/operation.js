const Router = require('koa-router');
const operationRouter = new Router();
const checkString = require('../../tools/checkString');
const {contentLength} = checkString;
operationRouter
  .patch('/config', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {uid} = ctx.params;
    const personalForum = await db.PersonalForumModel.findOnly({uid});
    if(user.uid !== uid && !personalForum.moderators.includes(user.uid)) ctx.throw(401, '权限不足');
    const {forumName, description, announcement, moderators} = ctx.body;
    if(contentLength(forumName) > 20) ctx.throw(400, '专栏名称不能大于20个字节(ASCII)');
    if(contentLength(announcement) > 1000) ctx.throw(400, '公告内容不能大于1000字节(ASCII)');
    if(contentLength(description) > 60) ctx.throw(400, '专栏介绍不能大于60字节(ASCII)');
    const moderatorsUidArr = [user.uid];
    for (let username of moderators) {
      const userObj = await db.UserModel.findOne({username});
      if(!userObj) ctx.throw(400, `用户 ${username} 不存在，请检查用户名。`);
      moderatorsUidArr.push(userObj.uid);
    }
    const personalForumOfSameName = await db.PersonalForumModel.findOne({displayName: forumName, uid: {$ne: uid}});
    const forumSameName = await db.ForumModel.findOne({displayName: forumName});
    if(personalForumOfSameName || forumSameName) ctx.throw(400, `专栏名称与现有的学院或个人专栏名称重复,不能使用`);
    await personalForum.update({
      displayName: forumName,
      descriptionOfForum: description,
      moderators: moderatorsUidArr,
      announcement
    });
    await next();
  });

module.exports = operationRouter;