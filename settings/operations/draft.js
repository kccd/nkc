module.exports = {
  preview: {
    GET: 'previewDraft',
  },
  history: {
    GET: 'viewHistoryDraft',
    PARAMETER: {
      GET: 'viewHistoryDraft',
      edit: {
        POST: 'historyEditDraft',
      },
    },
  },
};
