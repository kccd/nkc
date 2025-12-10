const ReviewLogModel = require('../../dataModels/ReviewLogModel');
const { translateReview } = require('../../nkcModules/translate');
const { reviewStatus } = require('../../settings/review');
class ReviewFinderService {
  #extendReason = (triggerType, triggerReason) => {
    // TODO: 添加多语言支持时，替换这里的lang
    const lang = 'zh_cn';
    return translateReview(lang, triggerType, [triggerReason]);
  };
  // 指定来源和来源ID，获取最近一次的审核理由说明
  getReviewReason = async (source, sid) => {
    const log = await ReviewLogModel.findOne(
      {
        sid,
        source,
      },
      {
        triggerType: 1,
        triggerReason: 1,
      },
    ).sort({ toc: -1 });
    let reason = '';
    if (log) {
      reason = this.#extendReason(log.triggerType, log.triggerReason);
    }
    return reason;
  };

  getReviewReasons = async (source, sourcesId) => {
    const reviewLogs = await ReviewLogModel.find(
      {
        source,
        sid: { $in: sourcesId },
        status: reviewStatus.pending,
      },
      {
        sid: 1,
        triggerType: 1,
        triggerReason: 1,
      },
    ).sort({ toc: -1 });

    const reasonsMap = new Map();
    for (const log of reviewLogs) {
      if (!reasonsMap.has(log.sid)) {
        const reason = this.#extendReason(log.triggerType, log.triggerReason);
        reasonsMap.set(log.sid, reason);
      }
    }
    return reasonsMap;
  };
}

module.exports = {
  reviewFinderService: new ReviewFinderService(),
};
