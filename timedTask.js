/*
* 定时任务 独立进程执行
* */

require('colors');
require('./global');

const updateDate = require("./settings/updateDate");

const jobs = require('./timedTasks/scheduleJob');
const timedTasks = require('./timedTasks/timedTasks');
const dbStatus = require('./settings/dbStatus');
const run = async () => {
  // 以下任务固定时间执行
  await dbStatus.database();
  jobs.updateActiveUsers(updateDate.updateActiveUsersCronStr);
  jobs.clearForumAndThreadPostCount();
  jobs.shop();
  jobs.moveRecycleMarkThreads();
  jobs.clearFileCache();
  jobs.preparationForumCheck();
  jobs.clearVerificationData();
  // 以下任务定时执行
  await timedTasks.cacheActiveUsers();
  await timedTasks.clearTimeoutPageCache();
  await timedTasks.updateRecommendThreads();
  await timedTasks.updateHomeHotColumns();
  await timedTasks.clearResourceState();
  await timedTasks.updateAllForumLatestThread();
  await timedTasks.updateForumsMessage();
  await timedTasks.modifyTimeoutApplicationForm();
  await timedTasks.modifyProjectCycle();
  if(process.connected) process.send('ready');
  process.on('message', function(msg) {
    if (msg === 'shutdown') {
      console.log(`timed task service ${global.NKC.processId} stopped`.green);
      process.exit(0);
    }
  });
};


run()
  .then(() => {
    console.log(`timed task is running`.green);
  })
  .catch(err => {
    console.log(`timed task stopped`.red);
    console.log((err.stack || err.message || err).red);
    process.exit(1);
  })
