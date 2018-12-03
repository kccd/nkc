const Router = require('koa-router');
const voteRouter = new Router();
voteRouter
  .use('/', async (ctx, next) => {
    const {data, db, params} = ctx;
    const {pid} = params;
    const post = await db.PostModel.findOnly({pid});
    const thread = await post.extendThread();
    const forum = await thread.extendForum();
    const isModerator = await forum.isModerator(data.user);
    const options = {
      roles: data.userRoles,
      grade: data.userGrade,
      isModerator,
      userOperationsId: data.userOperationsId,
      user: data.user
    };
    await post.ensurePermission(options);
    data.post = post;
    data.targetUser = await db.UserModel.findOnly({uid: post.uid});
    data.isModerator = isModerator;
    await next();
  })
  .post('/up', async (ctx, next) => {
    const {data, db} = ctx;
    const {user, post, isModerator} = data;
    let vote = await db.PostsVoteModel.findOne({uid: user.uid, pid: post.pid});
    // 普通用户1， 学者2， 专家5
    let weights = 1;
    if(user.xsf > 0) weights = 2;
    if(isModerator) weights = 5;
    if(!vote) {
      vote = db.PostsVoteModel({
        uid: user.uid,
        pid: post.pid,
        type: 'up',
        tUid: post.uid,
        num: weights
      });
      await vote.save();
      await db.KcbsRecordModel.insertSystemRecord('liked', data.targetUser, ctx);
    } else {
      if(vote.type === 'up') {
        await vote.remove();
        await db.KcbsRecordModel.insertSystemRecord('unLiked', data.targetUser, ctx);
      } else {
        await vote.update({tlm: Date.now(), type: 'up', num: weights});
        await db.KcbsRecordModel.insertSystemRecord('liked', data.targetUser, ctx);
      }
    }
    await post.updatePostsVote();
    post.voteUp = post.voteUp - post.voteDown;
    data.post = post;
    await next();
  })
  .post('/down', async (ctx, next) => {
    const {data, db} = ctx;
    const {user, post, isModerator} = data;
    let vote = await db.PostsVoteModel.findOne({uid: user.uid, pid: post.pid});
    // 普通用户1， 学者2， 专家5
    let weights = 1;
    if(user.xsf > 0) weights = 2;
    if(isModerator) weights = 5;
    if(!vote) {
      vote = db.PostsVoteModel({
        uid: user.uid,
        pid: post.pid,
        type: 'down',
        tUid: post.uid,
        num: weights
      });
      await vote.save();
    } else {
      if(vote.type === 'down') {
        await vote.remove();
      } else {
        await vote.update({tlm: Date.now(), type: 'down', num: weights});
        await db.KcbsRecordModel.insertSystemRecord('unLiked', data.targetUser, ctx);
      }
    }
    await post.updatePostsVote();
    post.voteUp = post.voteUp - post.voteDown;
    data.post = post;
    await next();
  });
module.exports = voteRouter;