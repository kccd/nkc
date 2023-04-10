module.exports = {
  preview: {
    GET: 'previewDocument',
  },
  history: {
    GET: 'viewHistoryDocument',
    PARAMETER: {
      GET: 'viewHistoryDocument',
      edit: {
        POST: 'historyEditDocument',
      },
    },
  },
};
