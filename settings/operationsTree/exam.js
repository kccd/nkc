const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitExamPaperList,
  record: {
    question: {
      GET: Operations.viewQuestionRecord,
    },
    paper: {
      GET: Operations.viewPaperRecord,
    },
  },
  categories: {
    POST: Operations.addExamsCategory,
    editor: {
      GET: Operations.visitEditCategory,
    },
  },
  category: {
    PARAMETER: {
      PUT: Operations.modifyExamsCategory,
    },
  },
  auth: {
    GET: Operations.visitExamsQuestionAuth,
    POST: Operations.submitExamsQuestionAuth,
  },
  paper: {
    GET: Operations.getExamsPaper,
    PARAMETER: {
      GET: Operations.getExamsPaper,
      POST: Operations.postExamsPaper,
    },
  },
  question: {
    PARAMETER: {
      DELETE: Operations.removeQuestion,
      disabled: {
        DELETE: Operations.enabledQuestion,
        POST: Operations.disabledQuestion,
      },
      image: {
        GET: Operations.getQuestionImage,
      },
      auth: {
        PUT: Operations.modifyQuestionAuthStatus,
      },
    },
  },
  questions: {
    GET: Operations.visitExamQuestionManagement,
  },
  editor: {
    GET: Operations.visitExamQuestionEditor,
  },
  public: {
    GET: Operations.visitPublicExam,
    takeExam: {
      GET: Operations.visitPublicExam,
    },
  },
};
