const {Eve, isMainThread, Thread} = require('node-threads-pool');
const db = require('../../../../dataModels');
let tp;
async function main(props) {
  const {
    id,
    groups,
    startingTime,
    endTime,
    markAsUnReviewed
  } = props;
  if(!tp) {
    tp = new Eve(__filename, 1);
  }
  const recycleId = await db.SettingModel.getRecycleId();
  const match = {
    mainForumsId: {$ne: recycleId}
  };
  if(startingTime && endTime) {
    match.toc = {
      $gte: startingTime,
      $lte: endTime
    };
  }
  const count = await db.PostModel.countDocuments(match);
  const limit = 1000;
  const filterLog = await db.FilterLogModel.findOne({_id: id});
  if(!filterLog) throw new Error(`filter log not found. id: ${id}`);
  await filterLog.updateTotal(count);
  if(count === 0) {
    await filterLog.markAsCompleted();
  }
  const threadCount = Math.ceil(count / limit);
  let threadNumber = 0;
  for(let i = 0; i < count; i += 1000) {
    tp.run({
      id,
      groups,
      match,
      start: i,
      limit,
      markAsUnReviewed
    })
      .then(async () => {
        threadNumber ++;
        if(threadNumber >= threadCount) {
          // 所有任务处理完毕
          await filterLog.markAsCompleted();
        }
      })
      .catch(async err => {
        await filterLog.saveErrorInfo(err.message || err.stack);
        console.error(err);
      });
  }
}

function thread() {
  new Thread(async props => {
    const {
      id,
      groups,
      match,
      markAsUnReviewed,
      start,
      limit
    } = props;
    const filterLog = await db.FilterLogModel.findOne({_id: id});
    if(!filterLog) throw new Error(`filter log not found. id: ${id}`);
    await filterLog.markAsProcessing();
    const posts = await db.PostModel.find(match, {
      t: 1,
      c: 1,
      pid: 1,
      uid: 1,
      type: 1,
      tid: 1
    })
      .sort({toc: 1}).skip(start).limit(limit);
    const targetId = new Set();
    const operator = await db.UserModel.findOne({uid: filterLog.operatorId}, {uid: 1, username: 1});
    for(const post of posts) {
      const matchedKeywords = await db.ReviewModel.matchKeywords(post.t + post.c, groups);
      if(matchedKeywords.length > 0) {
        targetId.add(post.pid);
        // 若不需要标记为待审或 post 已处于待审状态，则不处理
        if(!markAsUnReviewed || post.reviewed === false) continue;
        if(post.type === 'thread') {
          await db.ThreadModel.updateOne({tid: post.tid}, {$set: {reviewed: false}});
        }
        await db.PostModel.updateOne({pid: post.pid}, {$set: {reviewed: false}});
        await db.ReviewModel.newReview("includesKeyword", post, operator, `内容中包含敏感词 ${matchedKeywords.join("、")}`);
        // 更改状态为 待审核
      }
    }
    await filterLog.updateResultCount(posts.length, [...targetId]);
  });
}
if(isMainThread) {
  module.exports = main;
} else {
  thread();
}
