const { Operations } = require('../operations.js');
module.exports = {
  leftDraw: {
    GET: Operations.getLeftDrawData,
  },
  userDraw: {
    GET: Operations.getUserDrawData,
  },
  userNav: {
    GET: Operations.getUserNavData,
  },
};
