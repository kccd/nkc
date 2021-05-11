const fs = require('fs');
const path = require("path");

module.exports = (dir, exclude) => {
  exclude = exclude || [];
  const files = fs.readdirSync(dir).filter(filename => filename !== 'index.js' && !exclude.includes(filename));
  const modules = Object.create(null);
  for(const file of files) {
    modules[path.basename(file, '.js')] = require(path.join(dir, file));
  }
  return modules
};