const fs = require('fs');
const path = require('path');
const names = fs.readdirSync(path.resolve(__dirname));
const settings = [];
for(const name of names) {
  if(name === 'index.js') continue;
  const setting = require(path.resolve(__dirname, './' + name));
  settings.push(setting);
}
module.exports = settings;