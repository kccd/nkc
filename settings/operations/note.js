module.exports = {
  POST: "addNote",
  PARAMETER: {
    GET: "viewNote",
    c: {
      PARAMETER: {
        DELETE: "deleteNote",
        PATCH: "modifyNote"
      }
    }
  }
};