/**
 * 检测是否有筹备专业到达了截止日期
 * 如果有达到截止日期就检查是否达标
 * 不达标的删除此专业，所有帖子转移到另一个指定的专业中
 * 达标就修改此筹备专业为正式专业
 */

const {
  SettingModel,
  PreparationForumModel,
  ForumModel,
  ThreadModel,
  PostModel,
  SnapshotModel,
  MessageModel
} = require("../dataModels");

const minThreadCount = 50;

async function startCheck() {
  const forumSetting = await SettingModel.getSettings("forum");
  let archiveId = forumSetting.archive;
  if(!archiveId) return;
  // 检测是否有筹备专业到达了截止日期
  const pForums = await PreparationForumModel.find({review: "resolved"});
  console.log(`检查 ${pForums.length} 个已通过审核的筹备专业...`);
  for(let forum of pForums) {
    const { pfid, expired, fid, uid } = forum;
    if(Date.now() < expired.getTime()) continue;  // 没到截止日期,跳过
    console.log(`筹备专业 fid:${fid} 已到期`);
    // 到了截止日期
    // 查出此专业的文章数
    const threadCount = await ThreadModel.count({
      mainForumsId: {
        $elemMatch: { $eq: fid }
      }
    });
    if(threadCount >= minThreadCount) {           // 合格
      console.log(`文章数 ${threadCount} 合格`);
      // 修改为已转为正式专业
      await forum.update({
        $set: {
          formal: true
        }
      });
      // 发送通知给申请者
      await MessageModel.sendBecomeFormalForum({
        pfid,
        targetUid: uid,
        formal: true
      });
      console.log(`已发送通知给申请者`);
    } else {                                      // 不合格
      console.log(`文章数 ${threadCount} 少于${minThreadCount}篇 不合格`);
      // 发送通知给申请者
      await MessageModel.sendBecomeFormalForum({
        pfid,
        targetUid: uid,
        formal: false
      });
      console.log(`已发送通知给申请者`);
      // 移动所有帖子到归档专业
      await moveThread(fid, archiveId);
      console.log(`已移动所有文章到 fid: ${archiveId}(归档专业)`);
      // 删除此筹备专业(先打快照)
      await SnapshotModel.snapshotForum(fid);
      await ForumModel.remove({ fid });
      console.log(`已删除筹备专业`);
      // 删除此筹备专业申请
      await forum.remove();
      console.log(`已删除筹备专业申请记录`);
    }
  }
}


// 将一个专业中的所有帖子移动到另一个专业
async function moveThread(fid, targetFid) {
  // 找出所有需要移动的帖子
  const threads = await ThreadModel.find({
    mainForumsId: {
      $elemMatch: { $eq: fid }
    }
  }, {tid: 1});
  const threadsId = threads.map(t => t.tid);
  await ThreadModel.updateMany({tid: {$in: threadsId}}, {
    $pull: {
      mainForumsId: fid
    }
  });
  await ThreadModel.updateMany({tid: {$in: threadsId}}, {
    $addToSet: {
      mainForumsId: targetFid
    }
  });
  await PostModel.updateMany({tid: {$in: threadsId}}, {
    $pull: {
      mainForumsId: fid
    }
  });
  await PostModel.updateMany({tid: {$in: threadsId}}, {
    $addToSet: {
      mainForumsId: targetFid
    }
  });
}


module.exports = async () => {
  console.log(`> 开始检查筹备专业`);
  await startCheck();
  console.log(`> 筹备专业检查结束`);
};


// (async () => {
//   await PreparationForumModel.update({pfid: "8"}, {
//     expired: new Date()
//   });
//   console.log("ok");
// })();
