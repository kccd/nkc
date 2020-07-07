const {spawn} = require("child_process");

const watch = spawn(`gulp watch`, {
  shell: true
});

watch.stdout.pipe(process.stdout);
watch.stderr.pipe(process.stderr);

watch.on("close", (code) => {
  console.log(`自动编译已停止 CODE: ${code}`.red);
});
