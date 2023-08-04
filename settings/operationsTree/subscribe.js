const { Operations } = require('../operations.js');
module.exports = {
  moment: {
    GET: Operations.visitHome,
  },
  user: {
    GET: Operations.visitHome,
  },
  forum: {
    GET: Operations.visitHome,
  },
  column: {
    GET: Operations.visitHome,
  },
  thread: {
    GET: Operations.visitThread,
  },
};
