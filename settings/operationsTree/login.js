const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitLogin,
  POST: Operations.submitLogin,
};
