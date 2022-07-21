const Router = require('koa-router');
const voteRouter = new Router();
voteRouter
  .use('/', async (ctx, next) => {
    const {data, db, params} = ctx;
    const {pid} = params;
    const post = await db.PostModel.findOnly({pid});
    const thread = await post.extendThread();
    const forums = await thread.extendForums(['mainForums', 'minorForums']);
    let isModerator;
    for(const f of forums) {
      isModerator = await f.isModerator(data.user);
      if(isModerator) break;
    }
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
    await thread.updateThreadVote();
  })
  .post('/up', async (ctx, next) => {
    const {data, db} = ctx;
    const {user, post, isModerator} = data;
    const {post: postSource} = await db.PostsVoteModel.getVoteSources();
    let vote = await db.PostsVoteModel.findOne({source: postSource, uid: user.uid, sid: post.pid});
    // 普通用户1， 学者2， 专家5
    let weights = 1;
    if(user.xsf > 0) weights = 2;
    if(isModerator) weights = 5;
    const thread = await post.extendThread();
    ctx.state._scoreOperationForumsId = thread.mainForumsId;
    if(!vote) {
      vote = db.PostsVoteModel({
        source: postSource,
        uid: user.uid,
        sid: post.pid,
        type: 'up',
        tUid: post.uid,
        num: weights
      });
      await vote.save();
      let message = await db.MessageModel.findOne({'c.votesId': {$in: [vote._id]}, r: user.uid});
      //判断如果不存在消息就生成消息提示
      if(!message) {
        //生成点赞消息
        /*const message = await db.MessageModel({
          _id: await db.SettingModel.operateSystemID('messages', 1),
          r: post.uid,
          ty: 'STU',
          port: ctx.port,
          ip: ctx.address,
          c: {
            type: 'latestVotes',
            votesId: [vote._id],
          }
        }).save();
        await ctx.nkcModules.socket.sendMessageToUser(message._id);*/
        await db.KcbsRecordModel.insertSystemRecord('liked', data.targetUser, ctx);
      }
    } else {
      if(vote.type === 'up') {
        await vote.deleteOne();
        await db.KcbsRecordModel.insertSystemRecord('unLiked', data.targetUser, ctx);
      } else {
        await vote.updateOne({tlm: Date.now(), type: 'up', num: weights});
        await db.KcbsRecordModel.insertSystemRecord('liked', data.targetUser, ctx);
      }
    };
    await post.updatePostsVote();
    data.post = post;
    await next();
  })
  .post('/down', async (ctx, next) => {
    const {data, db} = ctx;
    const {user, post, isModerator} = data;
    const {post: postSource} = await db.PostsVoteModel.getVoteSources();
    let vote = await db.PostsVoteModel.findOne({source: postSource, uid: user.uid, sid: post.pid});
    const thread = await post.extendThread();
    ctx.state._scoreOperationForumsId = thread.mainForumsId;
    // 普通用户1， 学者2， 专家5
    let weights = 1;
    if(user.xsf > 0) weights = 2;
    if(isModerator) weights = 5;
    if(!vote) {
      vote = db.PostsVoteModel({
        source: postSource,
        uid: user.uid,
        sid: post.pid,
        type: 'down',
        tUid: post.uid,
        num: weights
      });
      await vote.save();
    } else {
      if(vote.type === 'down') {
        await vote.deleteOne();
      } else {
        await vote.updateOne({tlm: Date.now(), type: 'down', num: weights});
        await db.KcbsRecordModel.insertSystemRecord('unLiked', data.targetUser, ctx);
      }
    }
    await post.updatePostsVote();
    data.post = post;
    await next();
  });
module.exports = voteRouter;
