const router = require('koa-router')();
router
  .use('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {user} = data;
    const forumSettings = await db.SettingModel.getSettings('forum');
    const {reviewNewForumCert} = forumSettings;
    let hasPermission = false;
    for(const r of user.roles) {
      if(reviewNewForumCert.includes(r._id)) {
        hasPermission = true;
        break;
      }
    }
    if(!hasPermission) ctx.throw(403, `权限不足`);
    data.nav = 'applyForum';
    await next();
  })
  .get('/', async (ctx, next) => {
    const {db, data, query, nkcModules} = ctx;
    const {page = 0} = query;
    const count = await db.PreparationForumModel.countDocuments();
    const paging = nkcModules.apiFunction.paging(page, count);
    const pForums = await db.PreparationForumModel.find({}).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const result = [];
    const usersId = [];
    for(const f of pForums) {
      usersId.push(f.uid);
      for(const founder of f.founders) {
        usersId.push(founder.uid);
      }
    }
    const users = await db.UserModel.find({uid: {$in: usersId}}, {uid: 1, username: 1, avatar: 1});
    const usersObj = {};
    for(const u of users) {
      usersObj[u.uid] = u;
    }
    for(let forum of pForums) {
      const {toc, pfid, info, uid, formal, founders, review} = forum;
      result.push({
        user: usersObj[uid],
        pfid,
        founders: founders.map(f => {
          return {
            user: usersObj[f.uid],
            accept: f.accept
          }
        }),
        info,
        review,
        toc,
        formal
      });
    }
    data.pForums = result;
    data.paging = paging;
    ctx.template = 'nkc/applyForum/applyForum.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {db, body, data} = ctx;
    const {pfid, agree} = body;
    const pForum = await db.PreparationForumModel.findOnly({pfid});
    const review = agree? 'resolved': 'rejected';
    const founders = pForum.founders;
    for(const f of founders) {
      if(f.accept === 'pending') {
        f.accept = 'timeout';
      }
    }
    const updateObj = {
      review,
      founders
    };
    if(agree) {
      // 在正式专业表中创建筹备专业
      const newForum = await db.ForumModel.createForum(pForum.info.newForumName, "pForum");
      // 把创始人名单添加到记录中
      const agreeUsersId = pForum.founders.filter(f => f.accept === 'resolved').map(f => f.uid);
      agreeUsersId.unshift(pForum.uid);
      await db.ForumModel.updateOne({fid: newForum.fid}, {
        $set: {
          founders: agreeUsersId
        }
      });
      updateObj.fid = newForum.fid;
      updateObj.expired = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await pForum.updateOne(updateObj);
      // 发送审核通过消息
      await db.MessageModel.sendNewForumReviewResolve({
        pfid,
        fid: newForum.fid,
        targetUid: pForum.uid
      });
    } else {
      await pForum.updateOne(updateObj);
      await db.MessageModel.sendNewForumReviewReject({
        pfid,
        targetUid: pForum.uid
      });
    }
    data.review = review;
    await next();
  });
module.exports = router;
