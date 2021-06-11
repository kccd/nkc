const path = require("path");
const fs = require("fs");
const lessContent = fs.readFileSync(path.resolve(__dirname, "./lib/base.less")).toString();

module.exports = {
  buildTime: new Date(),
  cwd: process.cwd(),
  dirname: __dirname,
  filename: __filename,
  lessContent
}