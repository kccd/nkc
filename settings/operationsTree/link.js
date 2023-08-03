const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.linkToTarget,
  report: {
    POST: Operations.reportLinkToTarget,
  },
};
