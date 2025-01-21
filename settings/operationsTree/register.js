const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitMobileRegister,
  POST: Operations.submitRegister,
  mobile: {
    GET: Operations.visitMobileRegister,
    POST: Operations.submitRegister,
  },
  code: {
    GET: Operations.getRegisterCode,
  },
  subscribe: {
    GET: Operations.registerSubscribe,
    POST: Operations.registerSubscribe,
  },
  check: {
    POST: Operations.submitRegister,
  },
  exam: {
    GET: Operations.visitPublicExam,
    code: {
      GET: Operations.getRegisterExamCode,
    },
  },
};
