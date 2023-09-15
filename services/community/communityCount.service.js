const PostModel = require('../../dataModels/PostModel');
const apiFunction = require('../../nkcModules/apiFunction');
const getRedisKeys = require('../../nkcModules/getRedisKeys');
const redisClient = require('../../settings/redisClient');
class CommunityCount {
  getCommunityContentKey() {
    return getRedisKeys('communityContentCount');
  }
  async saveCommunityContentCount() {
    const postCount = await PostModel.countDocuments();
    const threadCount = await PostModel.countDocuments({ type: 'thread' });
    const postCountToday = await PostModel.countDocuments({
      toc: {
        $gte: apiFunction.today(),
      },
    });
    const key = this.getCommunityContentKey();
    await redisClient.setAsync(
      key,
      [threadCount, postCount, postCountToday].join(','),
    );
  }

  async getCommunityContentCount() {
    const key = this.getCommunityContentKey();
    const countString = await redisClient.getAsync(key);

    const [threadCount = 0, postCount = 0, postCountToday = 0] = countString
      ? countString.split(',')
      : [];

    return {
      threadCount,
      postCount,
      postCountToday,
    };
  }
}
module.exports = {
  communityCountService: new CommunityCount(),
};
