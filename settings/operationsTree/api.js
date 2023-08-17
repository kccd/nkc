const { Operations } = require('../operations.js');
module.exports = {
  v1: {
    server: {
      info: {
        GET: Operations.getServerInfo,
      },
    },
    account: {
      info: {
        GET: Operations.getAccountInfo,
      },
      card: {
        GET: Operations.getAccountCard,
      },
      drawer: {
        GET: Operations.getAccountDrawer,
      },
    },
    threads: {
      selector: {
        GET: Operations.getUserArticles,
      },
    },
    articles: {
      selector: {
        GET: Operations.getUserArticles,
      },
    },
    column: {
      PARAMETER: {
        articles: {
          POST: Operations.columnManage,
        },
      },
    },
    recycle: {
      'recycle-bin': {
        GET: Operations.api_get_recycle_recycleBin,
      },
    },
    review: {
      GET: Operations.getReviewData,
    },
    user: {
      PARAMETER: {
        'public-info': {
          GET: Operations.getUserPublicInfo,
        },
      },
    },
    users: {
      memo: {
        PUT: Operations.modifyUserMemo,
        GET: Operations.getUserMemo,
      },
    },
    exam: {
      tags: {
        GET: Operations.getQuestionTags,
        POST: Operations.createQuestionTag,
      },
      tag: {
        PARAMETER: {
          GET: Operations.getQuestionTag,
          PUT: Operations.putQuestionTag,
          DELETE: Operations.deleteQuestionTag,
        },
      },
      public: {
        register: {
          GET: Operations.openPublicExam,
        },
        paper: {
          PARAMETER: {
            GET: Operations.takePublicExam,
          },
        },
        result: {
          POST: Operations.submitPublicExam,
        },
      },
      questions: {
        POST: Operations.createExamQuestion,
      },
      question: {
        PARAMETER: {
          PUT: Operations.modifyExamQuestion,
        },
      },
    },
    register: {
      exam: {
        GET: Operations.registerExamCheck,
      },
    },
  },
};
