const { Operations } = require('../operations.js');
module.exports = {
  PARAMETER: {
    DELETE: Operations.deleteMoment,
    recovery: {
      POST: Operations.managementMoment,
    },
    disable: {
      POST: Operations.managementMoment,
    },
    comment: {
      GET: Operations.momentCommentControl,
      POST: Operations.momentCommentControl,
    },
    options: {
      GET: Operations.getMomentOption,
    },
    ipInfo: {
      GET: Operations.getMomentIpInfo,
    },
    visible: {
      GET: Operations.setMomentVisible,
      PUT: Operations.setMomentVisible,
    },
  },
};
