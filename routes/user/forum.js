const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    let { db, data } = ctx;
    let { user } = data;
    let { uid } = user;
    let pForums = await db.PreparationForumModel.find({uid});
    data.myPForums = pForums;
    let forumSetting = await db.SettingModel.getSettings("forum");
    // 是否有权限开办专业
    const {
      openNewForumCert = [],
      openNewForumGrade = [],
      openNewForumRelationship = "or"
    } = forumSetting;
    const certs = user.certs;
    const grades = user.grade.id;
    let allowCerts = openNewForumCert.filter(allowCert => certs.includes(allowCert));
    let allowGrades = openNewForumGrade.filter(allowGrade => grades.includes(allowGrade));
    if(openNewForumRelationship === "or") {
      if(!(allowCerts.length || allowGrades.length)) {
        ctx.throw(403, "权限不足");
        return next();
      }
    }
    if(openNewForumRelationship === "and") {
      if(!(allowCerts.length && allowGrades.length)) {
        ctx.throw(403, "权限不足");
        return next();
      }
    }
    data.reviewNewForumGuide = forumSetting.reviewNewForumGuide;
    ctx.template = "/user/forum/forum.pug";
    return next();
  })
  .post("/", async (ctx, next) => {
    let { data, body, db } = ctx;
    let { uid } = data.user;
    let { info, invites: founders } = body;
    // 在筹备专业表创建一个筹备专业
    let pfid = await db.PreparationForumModel.createPForum(uid, info, founders);
    // 发送消息给管理员，管理员审核通过后在专业表里创建一个筹备专业
    // 设置中查哪些角色可以审核
    let forumSetting = await db.SettingModel.getSettings('forum');
    let certs = forumSetting.reviewNewForumCert;
    let targetUsers = await db.UserModel.find({
      certs: {$in: certs}
    });
    for(let user of targetUsers) {
      await db.MessageModel.sendNewForumReviewMessage({uid: user.uid, pfid});
    }
    // 发送创始人邀请信息
    for(let uid of founders) {
      await db.MessageModel.sendInviteFounder({targetUid: uid, pfid});
    }
    return next();
  });
module.exports = router;