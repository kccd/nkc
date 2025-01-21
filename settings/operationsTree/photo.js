const { Operations } = require('../operations');
module.exports = {
  // 照片
  POST: Operations.uploadPhoto,
  PARAMETER: {
    GET: Operations.getPhoto,
    DELETE: Operations.deletePhoto,
  },
};
