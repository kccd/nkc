const PDFPreviewHandler = require("./PDFPreviewHandler");

// 用promise实现一个异步任务队列，保存队列的最后一个节点，用以后续继续追加任务
let syncTaskTail = Promise.resolve();

// 给异步任务队列追加一个异步任务
// 把处理器的处理结果或错误信息返回给主进程
function doTask(task, handler) {
    let {taskId, data} = task;
    syncTaskTail = syncTaskTail
        .then(() => handler(data))
        .then(result => process.send({success: true, taskId, data, result}))
        .catch(error => {
            console.error(error);
            process.send({success: false, taskId, data, error: error.stack})
        })
}

// 测试处理器
function debugHandler(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve({message: "Test passed", data});
        }, random(500, 3000));
    });
}

process.on("message", message => {
    let {taskId, data, debug} = message;
    debug
        ? doTask({taskId, data}, debugHandler)
        : doTask({taskId, data}, PDFPreviewHandler);
});


// 生成指定范围的随机数
function random(lower, upper) {
	return Math.floor(Math.random() * (upper - lower)) + lower;
}