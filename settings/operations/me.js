const { Operations } = require('../operations.js');
module.exports = {
  resource: {
    GET: Operations.getPersonalResources,
  },
  media: {
    GET: Operations.getPersonalMedia,
  },
  life_photos: {
    GET: Operations.getPersonalLifePhotos,
  },
};
