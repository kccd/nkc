const { Operations } = require('../operations.js');
module.exports = {
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
