module.exports = {
	add: {
		GET: 'visitAddProblem',
		POST: 'submitProblem'
	},
	list: {
		GET: 'visitProblemList',
		PARAMETER: {
			GET: 'visitProblem',
			PUT: 'modifyProblem',
			DELETE: 'deleteProblem'
		}
	},
  type: {
	  POST: 'addProblemsType',
    PARAMETER: {
	    PUT: 'modifyProblemsType',
      DELETE: 'deleteProblemsType'
    }
  }
};
