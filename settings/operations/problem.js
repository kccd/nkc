module.exports = {
	add: {
		GET: 'visitAddProblem',
		POST: 'submitProblem'
	},
	list: {
		GET: 'visitProblemList',
		PARAMETER: {
			GET: 'visitProblem',
			PATCH: 'modifyProblem',
			DELETE: 'deleteProblem'
		}
	},
  type: {
	  POST: 'addProblemsType',
    PARAMETER: {
	    PATCH: 'modifyProblemsType',
      DELETE: 'deleteProblemsType'
    }
  }
};