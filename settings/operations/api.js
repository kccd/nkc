const { Operations } = require('../operations.js');
module.exports = {
  v1: {
    server: {
      info: {
        GET: Operations.api_get_server_info,
      },
    },
    account: {
      info: {
        GET: Operations.api_get_account_info,
      },
      card: {
        GET: Operations.api_get_account_card,
      },
      drawer: {
        GET: Operations.api_get_account_drawer,
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
      GET: Operations.api_get_review_data,
    },
    user: {
      PARAMETER: {
        'public-info': {
          GET: Operations.api_get_user_public_info,
        },
      },
    },
    users: {
      memo: {
        PUT: Operations.api_put_user_memo,
        GET: Operations.api_get_user_memo,
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
        GET: Operations.getPublicExam,
        register: {
          GET: Operations.openPublicExam,
        },
        takeExam: {
          GET: Operations.takePublicExam,
        },
        submitExam: {
          POST: Operations.submitPublicExam,
        },
      },
    },
  },
};
