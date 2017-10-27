const fs = require('fs');

module.exports = dir => {
  const files = fs.readdirSync(dir).filter(e => e !== 'index.js');
  const modules = Object.create(null);
  for(const file of files) {
    modules[file.replace('.js', '')] = require(dir + '/' + file);
  }
  return modules
};