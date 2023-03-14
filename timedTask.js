/*
 * 定时任务 独立进程执行
 * */

require('colors');
require('./global');

const logger = require('./nkcModules/logger');
const updateDate = require('./settings/updateDate');

const jobs = require('./timedTasks/scheduleJob');
const timedTasks = require('./timedTasks/timedTasks');
const dbStatus = require('./settings/dbStatus');
const run = async () => {
  // 以下任务固定时间执行
  await dbStatus.database();
  jobs.updateActiveUsers(updateDate.updateActiveUsersCronStr);
  jobs.clearForumAndThreadPostCount();
  jobs.moveRecycleMarkThreads();
  jobs.disableToDraftPosts();
  jobs.clearFileCache();
  jobs.preparationForumCheck();
  jobs.clearVerificationData();
  // 以下任务定时执行
  await timedTasks.cacheActiveUsers();
  await timedTasks.cacheNewUsers();
  await timedTasks.clearTimeoutPageCache();
  await timedTasks.updateRecommendThreads();
  await timedTasks.updateHomeHotColumns();
  await timedTasks.clearResourceState();
  await timedTasks.initVerifiedUploadState();
  await timedTasks.updateAllForumLatestThread();
  await timedTasks.updateForumsMessage();
  await timedTasks.modifyTimeoutApplicationForm();
  await timedTasks.modifyProjectCycle();
  await timedTasks.initHomeBlocksTimeout();
  await timedTasks.updateShopStatus();
  if (process.connected) {
    process.send('ready');
  }
  process.on('message', function (msg) {
    if (msg === 'shutdown') {
      logger.error(`timed task service ${global.NKC.processId} stopped`);
      process.exit(0);
    }
  });
};

run()
  .then(() => {
    logger.info(`timed task is running`);
  })
  .catch((err) => {
    logger.error(`timed task stopped`);
    logger.error(err.stack || err.message || err);
    process.exit(1);
  });
