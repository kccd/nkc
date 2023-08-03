const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.getLibraryInfo,
  PARAMETER: {
    PUT: Operations.modifyLibraryFolder,
    POST: Operations.libraryUpload,
    GET: Operations.getLibraryInfo,
    list: {
      POST: Operations.createLibraryFolder,
      PUT: Operations.moveLibraryFolder,
      DELETE: Operations.deleteLibraryFolder,
    },
  },
};
