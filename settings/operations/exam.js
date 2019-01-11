module.exports = {
	GET: 'visitExamPaperList',
  category: {
	  POST: 'addExamsCategory',
    PARAMETER: {
	    POST: 'postQuestion',
	    GET: 'visitExamsCategory',
	    PATCH: 'modifyExamsCategory',
      DELETE: 'deleteExamsCategory'
    }
  },
  paper: {
	  GET: 'getExamsPaper',
	  PARAMETER: {
	    GET: 'getExamsPaper'
    }
  },
  question: {
	  PARAMETER: {
	    PATCH: 'modifyQuestion',
      disabled: {
	      DELETE: 'enabledQuestion',
        POST: 'disabledQuestion'
      },
	    image: {
	      GET: 'getQuestionImage'
      }
    }
  },
	PARAMETER: {
		GET: 'getExamPaper',
		POST: 'submitExamPaper'
	},
  add: {
	  GET: 'visitAddQuestion'
  }
};