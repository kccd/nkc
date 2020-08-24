const {Eve} = require('node-threads-pool');
const methods = require('./methods');
const PATH = require('path');
const threadPool = require('../settings/threadPool');
const tp = new Eve(PATH.resolve(__dirname, './thread.js'), threadPool.taskThreadCount);

const tasks = {};

for(const name in methods) {
  if(!methods.hasOwnProperty(name)) continue;
  tasks[name] = async (data) => {
    return tp.run({
      type: name,
      data
    });
  }
}

module.exports = tasks;
