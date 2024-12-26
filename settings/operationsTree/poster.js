const { Operations } = require('../operations');
module.exports = {
  // 活动海报
  PARAMETER: {
    GET: Operations.getActivityPoster,
  },
  POST: Operations.uploadActivityPoster,
};
