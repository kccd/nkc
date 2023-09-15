const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitCommunity,
  new: {
    GET: Operations.visitCommunityNew,
  },
  sub: {
    GET: Operations.visitCommunitySub,
  },
};
