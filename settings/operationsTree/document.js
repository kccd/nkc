const { Operations } = require('../operations.js');
module.exports = {
  preview: {
    GET: Operations.previewDocument,
  },
  history: {
    GET: Operations.viewHistoryDocument,
    PARAMETER: {
      GET: Operations.viewHistoryDocument,
      edit: {
        POST: Operations.historyEditDocument,
      },
    },
  },
};
