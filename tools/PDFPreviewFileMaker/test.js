const PDFPreviewFileWorker = require("./index");

(async () => {
  const worker = new PDFPreviewFileWorker();
  for(let i = 0; i < 5; i++) {
    worker.createTask(i, true)
      .then(taskResult => {
        console.log("处理完成, 结果:", taskResult.result);
      });
  }
  setTimeout(() => {
    worker.createTask("hello", true)
      .then(taskResult => {
        console.log("处理完成, 结果:", taskResult.result);
      });
  }, 2000);

  setTimeout(() => {
    worker.createTask("when empty task queue to push task", true)
      .then(taskResult => {
        console.log("处理完成, 结果:", taskResult.result);
      });
  }, 16000);
  // worker.close();
})();