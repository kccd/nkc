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
    // 添加自己为创始人
    await db.PreparationForumModel.update({pfid}, {
      $push: {
        founders: {
          accept: "resolve",
          uid
        }
      }
    });
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
  })
  .use('/', async (ctx, next) => {
    const {state, params} = ctx;
    if(state.uid !== params.uid) ctx.throw(400, `权限不足`);
    await next();
  })
  .use('/apply', async (ctx, next) => {
    const {db, state} = ctx;
    const hasPermission = await db.PreparationForumModel.hasPermissionToCreatePForum(state.uid);
    if(!hasPermission) ctx.throw(403, '权限不足');
    await next();
  })
  .get('/apply', async (ctx, next) => {
    const {db, data, state} = ctx;
    const forumSettings = await db.SettingModel.getSettings('forum');
    data.reviewNewForumGuide = forumSettings.reviewNewForumGuide;
    data.appliedForums = await db.PreparationForumModel.find({uid: state.uid});
    ctx.template = "/user/forum/apply.pug";
    await next();
  })
  .post('/apply', async (ctx, next) => {
    const {state, db, body, nkcModules} = ctx;
    const {uid} = state;
    const {checkString} = nkcModules.checkData;
    let {info, invites: founders} = body;
    const {newForumName, reason, youWantToDo} = info;
    for(const tUid of founders) {
      const u = await db.UserModel.count({uid: tUid});
      if(u === 0) ctx.throw(400, `uid错误 uid:${tUid}`);
    }
    if(founders.includes(uid)) ctx.throw(400, `无需邀请自己`);
    if(founders.length < 3) ctx.throw(400, `请至少邀请3人作为新专业的共同创始人`);
    checkString(newForumName, {
      name: '专业名称',
      minLength: 1,
      maxLength: 20
    });
    const sameForum = await db.ForumModel.count({displayName: newForumName});
    if(sameForum) ctx.throw(400, '专业名已存在，请更换');
    checkString(reason, {
      name: '开办理由',
      minLength: 1,
      maxLength: 1000
    });
    checkString(youWantToDo, {
      name: '贡献计划',
      minLength: 0,
      maxLength: 1000
    });
    const pfid = await db.PreparationForumModel.createPForum(uid, info, founders);
    const forumSettings = await db.SettingModel.getSettings("forum");
    const {reviewNewForumCert} = forumSettings;
    const users = await db.UserModel.find({certs: {$in: reviewNewForumCert}}, {uid: 1});
    // 发送消息给审核员
    for(const u of users) {
      await db.MessageModel.sendNewForumReviewMessage({uid: u.uid, pfid})
    }
    // 发送消息给队友
    for(const uid of founders) {
      await db.MessageModel.sendInviteFounder({targetUid: uid, pfid});
    }
    await next();
  })
  .use('/invitation', async (ctx, next) => {
    const {state, query, body, db, data} = ctx;
    let {pfid} = query;
    if(!pfid) pfid = body.pfid;
    const pForum = await db.PreparationForumModel.findOnly({pfid});
    let founder;
    for(const f of pForum.founders) {
      if(f.uid === state.uid) {
        founder = f;
        break;
      }
    }
    if(!founder) ctx.throw(403, `权限不足`);
    if(founder.accept === 'timeout') ctx.throw(403, `邀请已过期`);
    else if(['resolved', 'rejected'].includes(founder.accept)) ctx.throw(403, `邀请已处理`);
    data.founder = founder;
    await next();
  })
  .get('/invitation', async (ctx, next) => {
    const {query, db, data} = ctx;
    const {pfid} = query;
    const pForum = await db.PreparationForumModel.findOnly({pfid});
    const forumSettings = await db.SettingModel.getSettings('forum');
    data.pfid = pForum.pfid;
    data.forumName = pForum.info.newForumName;
    data.founderGuide = forumSettings.founderGuide;
    data.targetUser = await db.UserModel.findOnly({uid: pForum.uid}, {
      uid: 1,
      username: 1,
    });
    ctx.template = "user/forum/invitation.pug";
    await next();
  })
  .post('/invitation', async (ctx, next) => {
    const {db, body, state, data} = ctx;
    const {res, pfid} = body;
    if(!['resolved', 'rejected'].includes(res)) ctx.throw(400, `res参数错误 res: ${res}`);
    const pForum = await db.PreparationForumModel.findOne({pfid});
    const { founders } = pForum;
    for(let founder of founders) {
      if(founder.uid === state.uid) {
        founder.accept = res;
        await db.PreparationForumModel.update({pfid}, {
          $set: { founders }
        });
        return next();
      }
    }
    await next();
  });
module.exports = router;
