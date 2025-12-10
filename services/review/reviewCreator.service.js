const ReviewLogModel = require('../../dataModels/ReviewLogModel');
const { reviewSources, reviewStatus } = require('../../settings/review');
class ReviewCreatorService {
  // 创建一条处于等待审核状态的审核记录
  #createReviewLog = async (props) => {
    const { uid, source, sid, triggerType, triggerReason } = props;
    // 将之前的待审核记录置为无效
    await ReviewLogModel.updateMany(
      {
        source: source,
        sid: sid,
        status: reviewStatus.pending,
      },
      {
        $set: {
          status: reviewStatus.invalid,
        },
      },
    );
    const reviewLog = new ReviewLogModel({
      uid: uid,
      source: source,
      sid: sid,
      triggerType: triggerType,
      triggerReason: triggerReason,
      status: reviewStatus.pending,
    });
    await reviewLog.save();
    return reviewLog;
  };

  // 为document添加一条待审核记录
  createDocumentReviewLog = async (props) => {
    const { uid, documentId, triggerReason, triggerType } = props;
    return await this.#createReviewLog({
      uid: uid,
      source: reviewSources.document,
      sid: documentId,
      triggerType: triggerType,
      triggerReason: triggerReason,
    });
  };

  // 为post添加一条待审核记录
  createPostReviewLog = async (props) => {
    const { uid, postId, triggerReason, triggerType } = props;
    return await this.#createReviewLog({
      uid: uid,
      source: reviewSources.post,
      sid: postId,
      triggerType: triggerType,
      triggerReason: triggerReason,
    });
  };

  // 为note添加一条待审核记录
  createNoteReviewLog = async (props) => {
    const { uid, noteId, triggerReason, triggerType } = props;
    return await this.#createReviewLog({
      uid: uid,
      source: reviewSources.note,
      sid: noteId,
      triggerType: triggerType,
      triggerReason: triggerReason,
    });
  };
}

module.exports = {
  reviewCreatorService: new ReviewCreatorService(),
};
