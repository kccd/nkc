require('./global');
require('colors');
const fs = require('fs');
const path = require('path');
const lockFilePath = path.resolve(__dirname, `./install/install.lock`);

if(fs.existsSync(lockFilePath)) {
  const [, , reInstall] = process.argv;
  if(reInstall === '-r') {
    fs.unlinkSync(lockFilePath);
  } else {
    console.error(`The file install.lock already exists, if you need to reinstall, please execute 'npm run install -r'.\n\n`.red);
    process.exit(0);
  }
}

require('./install/server.js')
