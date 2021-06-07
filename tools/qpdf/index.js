const os = require("os");
const path = require("path");
const { execSync } = require("child_process");

let executablePath;
const platform = os.platform();
if(platform === "win32") {
  executablePath = path.join(__dirname, "qpdf-10.3.2-bin-mingw64/bin/qpdf.exe");
}
if(platform === "linux") {
  executablePath = path.join(__dirname, "qpdf-10.3.2-bin-linux-x86_64/bin/qpdf")
}

/**
 * 检测pdf是否带有访问密码
 * @param {string} filePath pdf路径
 */
function isWithPassword(filePath) {
  try {
    execSync(`${executablePath} --show-encryption ${filePath.split(path.sep).join("/")}`).toString();
  } catch (error) {
    const message = error.stderr.toString().trim();
    if(message.endsWith("No such file or directory")) {
      throw error;
    }
    return message.endsWith("invalid password");
  }
  return false;
}

module.exports = {
  isWithPassword
}
