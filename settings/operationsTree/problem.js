const { Operations } = require('../operations.js');
module.exports = {
  add: {
    GET: Operations.visitAddProblem,
    POST: Operations.submitProblem,
  },
  list: {
    GET: Operations.visitProblemList,
    PARAMETER: {
      GET: Operations.visitProblem,
      PUT: Operations.modifyProblem,
      DELETE: Operations.deleteProblem,
    },
  },
  type: {
    POST: Operations.addProblemsType,
    PARAMETER: {
      PUT: Operations.modifyProblemsType,
      DELETE: Operations.deleteProblemsType,
    },
  },
};
