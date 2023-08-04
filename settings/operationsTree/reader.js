const { Operations } = require('../operations.js');
module.exports = {
  pdf: {
    web: {
      viewer: {
        GET: Operations.pdfReader,
      },
    },
  },
};
