const { scheduleJob } = require('node-schedule');
const fs = require('fs');
const fsPromise = fs.promises;
const path = require('path');
require('colors');
const db = require('../dataModels');
const {
  PostModel,
  ThreadModel,
  UserModel,
  ActiveUserModel,
  SettingModel,
  ForumModel,
  VerificationModel,
  DocumentModel,
} = db;

const jobs = {};
jobs.updateActiveUsers = (cronStr) => {
  scheduleJob(cronStr, async () => {
    console.log('now updating the activeusers collection...'.blue);
    const aWeekAgo = Date.now() - 604800000;
    await ActiveUserModel.deleteMany();
    const recycleId = await SettingModel.getRecycleId();
    const data = await PostModel.aggregate([
      { $project: { _id: 0, pid: 1, toc: 1, uid: 1, tid: 1 } },
      { $match: { toc: { $gt: new Date(aWeekAgo) } } },
      { $group: { _id: '$uid', posts: { $push: '$$ROOT' } } },
    ]);
    for (let d of data) {
      let threadCount = 0,
        postCount = 0;
      const targetUser = await UserModel.findOnly({ uid: d._id });
      if (targetUser.certs.includes('banned')) {
        continue;
      }
      for (let post of d.posts) {
        const thread = await ThreadModel.findOne({
          tid: post.tid,
          oc: post.pid,
        });
        if (thread) {
          if (thread.fid !== recycleId && !thread.recycleMark) {
            threadCount++;
          }
        } else {
          const p = await PostModel.findOne({ pid: post.pid, disabled: false });
          if (p) {
            postCount++;
          }
        }
      }
      const vitality = 3 * threadCount + postCount;
      // const vitality = user.vitalityArithmetic(threadCount, postCount);
      const newActiveUser = new ActiveUserModel({
        lWThreadCount: threadCount,
        lWPostCount: postCount,
        uid: targetUser.uid,
        vitality,
      });
      await newActiveUser.save();
    }
    await ActiveUserModel.saveActiveUsersToCache();
  });
};

// 清除专业和文章上的今日更新
jobs.clearForumAndThreadPostCount = () => {
  scheduleJob(`0 0 0 * * *`, async () => {
    await ForumModel.updateMany(
      {
        countPostsToday: { $ne: 0 },
      },
      {
        $set: {
          countPostsToday: 0,
        },
      },
    );
    await ThreadModel.updateMany(
      {
        countToday: { $ne: 0 },
      },
      {
        $set: {
          countToday: 0,
        },
      },
    );
  });
};

// 凌晨4点，核对kcb账单
// 调整积分后 注释
/*jobs.checkKcbsRecords = async () => {
  scheduleJob("0 0 4 * * *", async () => {
    fork("./timedTasks/checkKcbsRecords.js");
  });
};*/

// 检查筹备专业
jobs.preparationForumCheck = () => {
  const preparationForumCheck = require('./preparationForumCheck');
  scheduleJob('0 0 4 * * *', async () => {
    await preparationForumCheck();
  });
};

// 自动将退修未修改的文章移动到回收站
jobs.moveRecycleMarkThreads = () => {
  scheduleJob('0 * * * * *', async () => {
    await ThreadModel.moveRecycleMarkThreads();
  });
};

// 自动将退修未修改的回复、评论移动到回收站(包含独立文章，回复，评论)
jobs.disableToDraftPosts = () => {
  scheduleJob('30 * * * * *', async () => {
    await PostModel.disableToDraftPosts();
    await DocumentModel.disabledToDraftDocuments();
  });
};

/*
 * 清理文件上传缓存 24小时以前的缓存
 * */
jobs.clearFileCache = () => {
  const { uploadDir } = require('../settings/upload');
  scheduleJob('0 0 4 * * *', async () => {
    console.log(`正在清理文件缓存...`);
    let count = 0;
    const time = Date.now() - 24 * 60 * 60 * 1000;
    const dir = await fsPromise.readdir(uploadDir);
    for (const d of dir) {
      if (d.indexOf('upload_') !== 0) {
        continue;
      }
      const filePath = path.resolve(uploadDir, `./${d}`);
      const state = await fsPromise.stat(filePath);
      if (!state.isFile()) {
        continue;
      }
      const fileTime = new Date(state.mtime).getTime();
      if (fileTime > time) {
        continue;
      }
      await fsPromise.unlink(filePath);
      count++;
    }
    console.log(`文件缓存清理完成，共清理文件${count}个`);
  });
};
/*
 * 清空24小时之前的图形验证码图片字段
 * */
jobs.clearVerificationData = () => {
  scheduleJob(`0 0 5 * * *`, async () => {
    console.log(`正在清理图形验证码...`);
    await VerificationModel.updateMany(
      {
        toc: { $lte: Date.now() - 24 * 60 * 60 * 1000 },
      },
      {
        $set: {
          c: null,
        },
      },
    );
    console.log(`图形验证码清理完成`);
  });
};

module.exports = jobs;
