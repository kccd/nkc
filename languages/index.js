const fs = require('fs');
const names = fs.readdirSync(__dirname);
const languages = {};
for(const name of names) {
  const stat = fs.statSync(__dirname + '/' + name);
  if(!stat.isDirectory()) continue;
  languages[name] = {};
  const dirPath = __dirname + '/' + name;
  const filesName = fs.readdirSync(dirPath);
  for(const fileName of filesName) {
    languages[name][fileName.replace(/\.json/i, '')] = require(dirPath + '/' + fileName);
  }
}
module.exports = languages;
