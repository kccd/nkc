module.exports = {
  GET: 'visitExamPaperList',
  record: {
    question: {
      GET: 'viewQuestionRecord'
    },
    paper: {
      GET: 'viewPaperRecord'
    }
  },
  categories: {
    POST: 'addExamsCategory',
    editor: {
      GET: 'visitEditCategory'
    }
  },
  category: {
    PARAMETER: {
	    PATCH: 'modifyExamsCategory',
    }
  },
  auth: {
    GET: 'visitExamsQuestionAuth',
    POST: 'submitExamsQuestionAuth'
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
  questions: {
    GET: 'visitExamQuestionManagement'
  },
  editor: {
	  GET: 'visitEditQuestion'
  }
};