require('./global');
require('colors');
const fs = require('fs');
if(!fs.existsSync('./install/install.lock')) {
  return require('./install/server.js')
} else {
  console.log(`程序已安装，若要重新安装请先移除文件install/install.lock`.red);
}
