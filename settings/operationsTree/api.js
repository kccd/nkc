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
      permission: {
        GET: Operations.checkAccountPermission,
      },
    },
    threads: {
      selector: {
        GET: Operations.getUserArticles,
        search: {
          GET: Operations.getUserArticles,
        },
      },
    },
    thread: {
      PARAMETER: {
        order: {
          GET: Operations.getThreadOrder,
          PUT: Operations.modifyThreadOrder,
        },
      },
    },
    articles: {
      selector: {
        GET: Operations.getUserArticles,
        search: {
          GET: Operations.getUserArticles,
        },
      },
      contribute: {
        POST: Operations.column_single_contribute,
      },
    },
    column: {
      PARAMETER: {
        GET: Operations.column_single_get,
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
          PARAMETER: {
            POST: Operations.submitPublicExam,
          },
        },
        'final-result': {
          PARAMETER: {
            POST: Operations.submitPublicExam,
          },
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
    editor: {
      moment: {
        PARAMETER: {
          GET: Operations.editorMoment,
          PUT: Operations.editorMoment,
          POST: Operations.editorMoment,
          rollback: {
            POST: Operations.rollbackZoneMomentHistory,
          },
        },
      },
    },
    forums: {
      tree: {
        GET: Operations.getForumsTree,
      },
    },
    zone: {
      GET: Operations.visitZone,
      m: {
        PARAMETER: {
          GET: Operations.visitZoneSingleMoment,
        },
      },
      editor: {
        rich: {
          GET: Operations.momentRichEditorGetDraft,
          PUT: Operations.momentRichEditorSaveDraft,
          POST: Operations.momentRichEditorPublish,
        },
        plain: {
          GET: Operations.momentPlainEditorGetDraft,
          PUT: Operations.momentPlainEditorSaveDraft,
          POST: Operations.momentPlainEditorPublish,
        },
      },
      moment: {
        PARAMETER: {
          editor: {
            rich: {
              GET: Operations.momentRichEditorGetDraft,
              PUT: Operations.momentRichEditorSaveDraft,
              POST: Operations.momentRichEditorPublish,
            },
            plain: {
              GET: Operations.momentPlainEditorGetDraft,
              PUT: Operations.momentPlainEditorSaveDraft,
              POST: Operations.momentPlainEditorPublish,
            },
          },
          rollback: {
            POST: Operations.rollbackZoneMomentHistory,
          },
        },
      },
    },
  },
};
