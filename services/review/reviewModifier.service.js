const ReviewLogModel = require('../../dataModels/ReviewLogModel');
const { reviewStatus } = require('../../settings/review');
class ReviewModifierService {
  #modifyReviewLogStatus = async (props) => {
    const { source, sid, status, handlerId, handlerReason } = props;
    const reviewLog = await ReviewLogModel.findOne({
      source,
      sid,
      status: reviewStatus.pending,
    }).sort({ toc: -1 });

    if (!reviewLog) {
      return;
    }

    await reviewLog.updateOne({
      $set: {
        status: status,
        handlerId: handlerId,
        handlerReason: handlerReason,
        tlm: new Date(),
      },
    });
  };

  modifyReviewLogStatusToApproved = async (props) => {
    const { source, sid, handlerId, handlerReason } = props;
    await this.#modifyReviewLogStatus({
      source,
      sid,
      handlerId: handlerId,
      status: reviewStatus.approved,
      handlerReason: handlerReason,
    });
  };

  modifyReviewLogStatusToRevised = async (props) => {
    const { source, sid, handlerId, handlerReason } = props;
    await this.#modifyReviewLogStatus({
      source,
      sid,
      handlerId: handlerId,
      status: reviewStatus.revised,
      handlerReason: handlerReason,
    });
  };

  modifyReviewLogStatusToDeleted = async (props) => {
    const { source, sid, handlerId, handlerReason } = props;
    await this.#modifyReviewLogStatus({
      source,
      sid,
      handlerId: handlerId,
      status: reviewStatus.deleted,
      handlerReason: handlerReason,
    });
  };
}

module.exports = {
  reviewModifierService: new ReviewModifierService(),
};
