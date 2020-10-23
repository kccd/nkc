const {fork} = require("child_process");
const path = require("path");

class PDFPreviewFileWorker {
  constructor() {
    this.cp = fork(path.resolve(__dirname, "./worker.js"));
    this.closed = false;
    this.bindTaskDoneTrigger();
  }

  // 任务队列
  runningTasks = new Map();
  maxTaskId = 0;

  makeFile({ path, output, footerJPGPath }) {
    return this.createTask({ path, output, footerJPGPath })
  }

  createTask(data, debug) {
    let {cp, runningTasks} = this;
    let taskId = this.maxTaskId += 1;
    return new Promise((resolve, reject) => {
      runningTasks.set(taskId, resolve);
      cp.send({taskId, data, debug}, err => {
        if(err) return reject(err);
      });
    })
  }

  bindTaskDoneTrigger() {
    let {cp, runningTasks} = this;
    cp.on("message", message => {
      let {success, taskId, result, error} = message;
      if(!runningTasks.has(taskId)) return;
      let taskResolveHandle = runningTasks.get(taskId);
      taskResolveHandle({success, result, error});
      runningTasks.delete(taskId);
    });
  }

  close() {
    return this.cp.kill();
  }
}

module.exports = PDFPreviewFileWorker;
