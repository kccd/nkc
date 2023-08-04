const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.stickerCenter,
  POST: Operations.modifySticker,
  PARAMETER: {
    GET: Operations.getSticker,
  },
};
