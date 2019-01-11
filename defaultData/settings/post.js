module.exports = {
  _id: 'post',
  c: {
    postToForum: {
      authLevelMin: 0,
      exam: {
        volumeA: true,
        volumeB: true,
        notPass: {
          status: true,
          countLimit: 5,
          unlimited: true
        }
      }
    },
    postToThread: {
      authLevelMin: 0,
      exam: {
        volumeA: true,
        volumeB: true,
        notPass: {
          status: true,
          unlimited: true,
          countLimit: 5
        }
      }
    }
  }
};