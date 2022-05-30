const router = require('koa-router')();

router
  .use('/', async (ctx, next) => {
    const {data, db , params} = ctx;
    const {_id} = params;
    const comment = await db.CommentModel.findOnly({_id});
    data.comment = comment;
    data.targetUser = await db.UserModel.findOnly({uid: comment.uid});
    await next();
  })
  .post('/up', async (ctx, next) => {
    //独立文章点赞
    const {db, data} = ctx;
    const {comment, user} = data;
    const {comment: commentSource} = await db.PostsVoteModel.getVoteSources();
    let vote = await db.PostsVoteModel.findOne({source: commentSource, uid: user.uid, sid: comment._id});
    let weights = 1;
    if(user.xsf > 0) weights = 2;
    //生成点赞记录
    if(!vote)  {
      vote = db.PostsVoteModel({
        source: commentSource,
        uid: user.uid,
        sid: comment._id,
        type: 'up',
        tUid: comment.uid,
        num: weights,
      });
    }
    await vote.save();
    const message = await db.MessageModel.findOne({'c.votesId': {$in: [vote._id]}, r: comment.uid});
    //如果数据库中不存在消息就生成提示消息
    if(!message) {
      //生成提示消息
      const a=await db.MessageModel({
        _id: await db.SettingModel.operateSystemID('messages', 1),
        r: comment.uid,
        ty: 'STU',
        port: ctx.port,
        ip: ctx.address,
        c: {
          type: 'latestVotes',
          votesId: [vote._id],
        }
      }).save();
      //执行操作后的加减积分
      await db.KcbsRecordModel.insertSystemRecord('liked', data.targetUser, ctx);
    } else {
      if(vote.type === 'up') {
        await vote.deleteOne();
        await db.KcbsRecordModel.insertSystemRecord('unLiked', data.targetUser, ctx);
      } else {
        await vote.updateOne({tlm: Date.now(), type: 'up', num: weights});
        await db.KcbsRecordModel.insertSystemRecord('liked', data.targetUser, ctx);
      }
    }
    await comment.updateCommentsVote();
    data.comment = comment;
    await next();
  })
  .post('/down', async (ctx, next) => {
    //独立文章点踩
    const {db, data} = ctx;
    const {comment, user} = data;
    const {comment: commentSource} = await db.PostsVoteModel.getVoteSources();
    let vote = await db.PostsVoteModel.findOne({source: commentSource, uid: user.uid, sid: comment._id});
    let weights = 1;
    if(user.xsf > 0) weights = 2;
    if(!vote) {
      vote = db.PostsVoteModel({
        source: commentSource,
        uid: user.uid,
        sid: comment._id,
        type: 'down',
        tUid: comment.uid,
        num: weights,
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
    await comment.updateCommentsVote();
    data.comment = comment;
    await next();
  })

module.exports = router;
