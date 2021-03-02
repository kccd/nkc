const {spawn} = require("child_process");

// 临时解决开发环境 警告
require('events').defaultMaxListeners = 30;

const watch = spawn(`gulp watch`, {
  shell: true
});

watch.stdout.pipe(process.stdout);
watch.stderr.pipe(process.stderr);


watch.on("close", (code) => {
  console.log(`自动编译已停止 CODE: ${code}`.red);
});
