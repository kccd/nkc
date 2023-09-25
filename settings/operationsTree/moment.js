const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitZoneSingleMoment,
  PARAMETER: {
    DELETE: Operations.deleteMoment,
    recovery: {
      POST: Operations.managementMoment,
    },
    disable: {
      POST: Operations.managementMoment,
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
