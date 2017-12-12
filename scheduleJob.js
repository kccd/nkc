const {scheduleJob} = require('node-schedule');

const settings = require('./settings');
const {database, elastic} = settings;
const {client} = elastic;

const jobs = {};
jobs.updateActiveUsers = cronStr => {
  scheduleJob(cronStr, () => {
    console.log('now updating the activeusers collection...'.blue);
    let threadCount = [];
    let postCount = [];
    const aWeekAgo = Date.now() - 604800000;
  })
};

jobs.truncateUsersLoginToday = cronStr => {

};
jobs.indexToES = cronStr => {

};

module.exports = jobs;