const {scheduleJob} = require('node-schedule');

const settings = require('./settings');
const {database, elastic, user} = settings;
const {client} = elastic;

const {PostModel, ThreadModel, UserModel, ActiveUserModel} = require('./dataModels');

const jobs = {};
jobs.updateActiveUsers = cronStr => {
  scheduleJob(cronStr, async () => {
    console.log('now updating the activeusers collection...'.blue);
    const aWeekAgo = Date.now() - 604800000;
    await ActiveUserModel.deleteMany();
    const data = await PostModel.aggregate([
      {$project: {_id: 0,pid: 1, toc: 1, uid: 1, tid: 1}},
      {$match: {toc: {$gt: new Date(aWeekAgo)}}},
      {$group: {_id: '$uid', posts: {$push: '$$ROOT'}}}
    ]);
    for(let d of data){
      let threadCount = 0, postCount = 0;
      const targetUser = await UserModel.findOnly({uid: d._id});
      for (let post of d.posts) {
        const thread = await ThreadModel.findOne({tid: post.tid, oc: post.pid});
        if(thread) {
          threadCount++;
        } else {
          postCount++;
        }
      }
      const vitality = user.vitalityArithmetic(threadCount, postCount, targetUser.xsf);
      const newActiveUser = new ActiveUserModel({
        lWThreadCount: threadCount,
        lWPostCount: postCount,
        uid: targetUser.uid,
        vitality
      });
      await newActiveUser.save();
    }
  })
};

jobs.truncateUsersLoginToday = cronStr => {

};
jobs.indexToES = cronStr => {

};

module.exports = jobs;
