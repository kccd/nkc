const UsersPersonalModel = require('../../dataModels/UsersPersonalModel');
const { reviewTriggerType } = require('../../settings/review');

class ReviewCheckerService {
  getVerifyPhoneNumberReviewStatus = async (uid) => {
    if (await UsersPersonalModel.shouldVerifyPhoneNumber(uid)) {
      return {
        needReview: true,
        type: reviewTriggerType.unverifiedPhone,
        reason: '',
      };
    } else {
      return {
        needReview: false,
        type: '',
        reason: '',
      };
    }
  };
}

module.exports = {
  reviewCheckerService: new ReviewCheckerService(),
};
