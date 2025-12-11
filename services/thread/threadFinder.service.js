const ThreadModel = require('../../dataModels/ThreadModel');
class ThreadFinderService {
  getThreadsMapByIds = async (threadIds) => {
    const threads = await ThreadModel.find({
      tid: { $in: threadIds },
    });
    const threadsMap = new Map();
    for (const thread of threads) {
      threadsMap.set(thread.tid, thread);
    }
    return threadsMap;
  };
}

module.exports = {
  threadFinderService: new ThreadFinderService(),
};
