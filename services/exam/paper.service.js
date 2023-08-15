const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const ExamsPaperModel = require('../../dataModels/ExamsPaperModel');
const { ResponseTypes } = require('../../settings/response');
const {
  activationCodeSources,
  activationCodeValidityPeriod,
} = require('../../settings/activationCode');

class PaperService {
  async getPaperById(paperId) {
    const paper = await ExamsPaperModel.findOne({ _id: paperId });
    if (!paper) {
      ThrowBadRequestResponseTypeError(ResponseTypes.INVALID_EXAM_PAPER_ID, [
        paperId,
      ]);
    }
    return paper;
  }
  async createActivationCodeByPaperId(paperId) {
    const {
      activationCodeService,
    } = require('../activationCode/activationCode.service');
    const paper = await this.getPaperById(paperId);
    return await activationCodeService.createActivationCode({
      source: activationCodeSources.examPaper,
      sid: paper._id,
      expiration: Date.now() + activationCodeValidityPeriod.examPaper,
    });
  }
}

module.exports = {
  paperService: new PaperService(),
};
