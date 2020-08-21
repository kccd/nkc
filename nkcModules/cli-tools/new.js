let cols = process.stdout.columns;
process.stdout.on('resize', () => cols = process.stdout.columns);
const cliCursor = require('cli-cursor');
const ansiEscapes = require('ansi-escapes');
const readline = require('readline');
let color = require("colors");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '',
  terminal: true
});


/**
 * 重复字符串拼接
 * @param {string} str - 要重复的字符串
 * @param {number} times - 要重复的次数
 */
function repeat(str, times) {
  if(times == 0 || !str) return "";
  return str + repeat(str, times - 1);
}

/**
 * 更新最后一行输出
 */
function renderLine(rl, content) {
  cliCursor.hide();
  rl.output.write(ansiEscapes.eraseLines(1));
  rl.output.write(content);
}

// 进度条总长度(字符)
const processLength = 30;


/**
 * 在当前行输出进度条
 * @param {number} process - 0 到 1之间的数，表示百分比
 */
function printProcess(process, text) {
  process = parseFloat(process);
  process = Math.round(process * 10000) / 10000;
  if(process >= 1) {
    renderLine(rl, `${repeat("█", processLength)} 100% ${color.green("完成")}`);
    cliCursor.show();
    return;
  }
  let s = Math.round(processLength * process);
  let l = processLength - s;
  let p = repeat("█", s) + repeat("░", l);
  renderLine(rl, `${p} ${String(process * 100).substr(0, 4)}% ${text || ""}`);
}


/**
 * 延时工具
 * @param {number} time - 毫秒
 */
async function sleep(time) {
  return new Promise((resolve, _) => {
    setTimeout(resolve, time)
  })
}


// 程序被退出时
rl.on("SIGINT", function() {
  cliCursor.show();
  rl.close();
  process.exit(0);
});


module.exports = {
  printProcess,
  sleep
}