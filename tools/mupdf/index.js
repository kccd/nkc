const {resolve} = require("path");
const {exec} = require("child_process");
const fs = require('fs');
const fsPromise = fs.promises;
const {spawnProcess} = require('../imageMagick');
let toolPath = resolve(__dirname, "./bin/mutool.exe");

// 判断pdf是否有限制密码
async function hasPassword(input) {
  const result = await spawnProcess(toolPath, ['info', '-d', '-', input]);
  return result.includes("Encryption object");
  /*return new Promise((resolve, reject) => {
    try {
      exec(`${toolPath} info -d - ${input}`,
      {
        maxBuffer: 200 * 1024 * 1024
      },
      function(err, stdout, stderr) {
        if(err) return reject(err);
        resolve(stdout.includes("Encryption object"));
      })
    } catch (error) {
      return reject(error);
    }
  });*/
}

// 清除pdf中的限制密码
// 注意 不能输入输出不能同路径
async function cleanPassword(input, output) {
  return spawnProcess(toolPath, ['clean', '-p', '-', input, output]);
  /*return new Promise((resolve, reject) => {
    exec(`${toolPath} clean -p - ${input} ${output}`,
    {
      maxBuffer: 200 * 1024 * 1024
    },
    function(err, stdout, stderr) {
      if(stderr) reject(stderr);
      resolve();
    });
  })*/
}

module.exports = {
  hasPassword,
  cleanPassword
}
