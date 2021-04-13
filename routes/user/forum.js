const Router = require("koa-router");
const router = new Router();
router
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
      const u = await db.UserModel.countDocuments({uid: tUid});
      if(u === 0) ctx.throw(400, `uid错误 uid:${tUid}`);
    }
    if(founders.includes(uid)) ctx.throw(400, `无需邀请自己`);
    if(founders.length < 3) ctx.throw(400, `请至少邀请3人作为新专业的共同创始人`);
    checkString(newForumName, {
      name: '专业名称',
      minLength: 1,
      maxLength: 20
    });
    const sameForum = await db.ForumModel.countDocuments({displayName: newForumName});
    if(sameForum) ctx.throw(400, '专业名已存在，请更换');
    checkString(reason, {
      name: '开办理由',
      minLength: 400,
      maxLength: 9999999
    });
    checkString(youWantToDo, {
      name: '贡献计划',
      minLength: 0,
      maxLength: 9999999
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
        await db.PreparationForumModel.updateOne({pfid}, {
          $set: { founders }
        });
        return next();
      }
    }
    await next();
  });
module.exports = router;
