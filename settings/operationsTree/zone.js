const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitZone,
  a: {
    PARAMETER: {
      GET: Operations.visitZoneArticle,
      category: {
        PUT: Operations.manageZoneArticleCategory,
      },
    },
  },
  m: {
    PARAMETER: {
      GET: Operations.visitZoneSingleMoment,
      vote: {
        POST: Operations.zoneMomentVote,
      },
      comments: {
        GET: Operations.getZoneMomentComments,
        child: {
          GET: Operations.getZoneMomentComments,
        },
      },
      repost: {
        GET: Operations.getZoneMomentComments,
      },
      comment: {
        PARAMETER: {
          DELETE: Operations.deleteZoneMomentComment,
          vote: {
            POST: Operations.zoneMomentCommentVote,
          },
          options: {
            GET: Operations.getZoneMomentCommentOptions,
          },
        },
      },
      history: {
        GET: Operations.visitZoneMomentHistory,
      },
    },
  },
  editor: {
    rich: {
      GET: Operations.visitMomentRichEditor,
      history: {
        GET: Operations.visitMomentRichEditorHistory,
      },
    },
  },
};
