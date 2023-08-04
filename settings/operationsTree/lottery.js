const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitLottery,
  POST: Operations.getRedEnvelope,
  DELETE: Operations.closeRedEnvelope,
};
