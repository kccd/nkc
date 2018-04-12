const jobs = require('./scheduleJob');
const colors = require('colors');
jobs.backupDatabase();
console.log('自动备份工具已启动...'.green);