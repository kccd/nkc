const moment = require('moment');

function generateFolderName() {
  return moment.format('/YYYY/MM/')
}

module.exports = {
  generateFolderName
};