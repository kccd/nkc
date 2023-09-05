const { Operations } = require('../operations.js');
module.exports = {
  POST: Operations.saveNewEditPicture,
  getOriginId: {
    PUT: Operations.getOriginId,
  },
};
