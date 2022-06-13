module.exports = {
  preview:{
    GET:'previewDraftt'
  },
  history:{
    GET:'viewHistoryDraft',
    PARAMETER:{
      GET:'viewHistoryDraft',
      edit:{
        POST:'historyEditDraft',
      }
    }
  }
}