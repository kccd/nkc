module.exports = {
	GET: 'visitExamPaperList',
  category: {
	  POST: 'addExamsCategory',
    PARAMETER: {
	    GET: 'visitExamsCategory',
	    PATCH: 'modifyExamsCategory',
      DELETE: 'deleteExamsCategory'
    }
  },
  paper: {
	  GET: 'getExamsPaper',
	  PARAMETER: {
	    GET: 'getExamsPaper',
      POST: 'postExamsPaper'
    }
  },
  question: {
    POST: 'postQuestion',
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
  editor: {
	  GET: 'visitEditQuestion'
  }
};