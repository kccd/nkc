module.exports = {
  GET: "viewNote",
  POST: "addNote",
  PARAMETER: {
    GET: "viewNote",
    c: {
      PARAMETER: {
        DELETE: "deleteNote",
        PUT: "modifyNote"
      }
    }
  }
};
