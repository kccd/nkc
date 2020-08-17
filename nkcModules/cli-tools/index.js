const readline = require('readline');
let color = require("colors");


/**
 * 重复字符串拼接
 * @param {string} str - 要重复的字符串
 * @param {number} times - 要重复的次数
 */
function repeat(str, times) {
  if(times == 0 || !str) return "";
  return str + repeat(str, times - 1);
}


const processLength = 20;

/**
 * 在当前行输出进度条
 * @param {number} process - 0 到 1之间的数，表示百分比
 */
function printProcess(stream, process, text) {
  process = parseFloat(process);
  process = Math.round(process * 10000) / 10000;
  readline.clearLine(stream);
  readline.cursorTo(stream, 0);
  if(process >= 1) {
    stream.write(`████████████████████ 100% ${color.green("完成")}`,'utf-8');
    return;
  }
  let s = Math.round(processLength * process);
  let l = processLength - s;
  let p = repeat("█", s) + repeat("░", l);
  stream.write(`${p} ${String(process * 100).substr(0, 4)}% ${text || ""}`,'utf-8');
}

exports.printProcess = printProcess;


/**
 * 延时工具
 * @param {number} time - 毫秒
 */
async function sleep(time) {
  return new Promise((resolve, _) => {
    setTimeout(resolve, time)
  })
}

exports.sleep = sleep;