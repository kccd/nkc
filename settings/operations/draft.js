const { Operations } = require('../operations.js');
module.exports = {
  preview: {
    GET: Operations.previewDraft,
  },
  history: {
    GET: Operations.viewHistoryDraft,
    PARAMETER: {
      GET: Operations.viewHistoryDraft,
      edit: {
        POST: Operations.historyEditDraft,
      },
    },
  },
};
