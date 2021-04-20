const fs = require('fs');

module.exports = (dir, exclude) => {
  exclude = exclude || [];
  const files = fs.readdirSync(dir).filter(filename => filename !== 'index.js' && !exclude.includes(filename));
  const modules = Object.create(null);
  for(const file of files) {
    modules[file.replace('.js', '')] = require(dir + '/' + file);
  }
  return modules
};