module.exports = {
  preview:{
    GET:'previewDocument'
  },
  history:{
    GET:'viewHistoryDocument',
    PARAMETER:{
      GET:'viewHistoryDocument',
      // publish:{
      //   GET:'historyPublish',
      // },
      edit:{
        POST:'historyEdit',
      }
      
    }
  }
   
}