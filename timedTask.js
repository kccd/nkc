/*
* 定时任务 独立进程执行
* */

require('colors');
require('./global');

const updateDate = require("./settings/updateDate");

const jobs = require('./timedTasks/scheduleJob');
const timedTasks = require('./timedTasks/timedTasks');
const run = async () => {
  // 以下任务固定时间执行
  jobs.updateActiveUsers(updateDate.updateActiveUsersCronStr);
  jobs.clearForumAndThreadPostCount();
  jobs.shop();
  jobs.backupDatabase();
  jobs.moveRecycleMarkThreads();
  jobs.clearFileCache();
  jobs.preparationForumCheck();
  jobs.nkcRestart();
  // 以下任务定时执行
  await timedTasks.cacheActiveUsers();
  await timedTasks.clearTimeoutPageCache();
  await timedTasks.updateRecommendThreads();
  await timedTasks.clearResourceState();
  await timedTasks.updateAllForumLatestThread();
  await timedTasks.updateForumsMessage();
  process.send('ready');
  process.on('message', function(msg) {
    if (msg === 'shutdown') {
      server.close();
      console.log(`timed task service ${global.NKC.processId} has stopped`.green);
      process.exit(0);
    }
  });
};


run()
  .then(() => {
    console.log(`timed task is running`.green);
  })
  .catch(err => {
    console.log(`timed task has stopped`.red);
    console.log((err.stack || err.message || err).red);
  })
