module.exports = {
  GET: "getLibraryInfo",
  PARAMETER: {
    PATCH: "modifyLibraryFolder",
    POST: "libraryUpload",
    GET: "getLibraryInfo",
    list: {
      POST: "createLibraryFolder",
      PATCH: "moveLibraryFolder",
      DELETE: "deleteLibraryFolder"
    },
  }
};