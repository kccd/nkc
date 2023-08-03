const { Operations } = require('../operations.js');
module.exports = {
  move: {
    POST: Operations.moveThreads,
  },
  draft: {
    POST: Operations.movePostsToDraft,
  },
  recycle: {
    POST: Operations.movePostsToRecycle,
  },
  unblock: {
    POST: Operations.unblockPosts,
  },
};
