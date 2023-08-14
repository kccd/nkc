const randomize = require('randomatic');
const {
  ThrowServerInternalError,
  ThrowBadRequestResponseTypeError,
} = require('../../nkcModules/error');
const ExamsPaperModel = require('../../dataModels/ExamsPaperModel');
const { ResponseTypes } = require('../../settings/response');
const { paperTokenValidityPeriod } = require('../../settings/exam');
const redLock = require('../../nkcModules/redLock');

class PaperService {
  async getPaperById(paperId) {
    const paper = await ExamsPaperModel.findOne({ paperId });
    if (!paper) {
      ThrowBadRequestResponseTypeError(ResponseTypes.INVALID_EXAM_PAPER_ID, [
        paperId,
      ]);
    }
    return paper;
  }

  async createNewPaperToken() {
    const lock = await redLock.lock(`createExamPaperToken`, 6000);
    for (let i = 10; i > 0; i--) {
      const token = randomize('A0', 64);
      const paper = await ExamsPaperModel.findOne({ token }, { _id: 1 });
      if (!paper) {
        await lock.unlock();
        return token;
      }
    }
    await lock.unlock();
    ThrowServerInternalError(`Exam paper token error`);
  }

  async checkPaperToken(paperId, token) {
    const now = Date.now();
    const paper = await this.getPaperById(paperId);
    if (paper.token !== token) {
      // token不匹配
      ThrowBadRequestResponseTypeError(
        ResponseTypes.INVALID_EXAM_PAPER_TOKEN,
        token,
      );
    }
    if (now - paper.tlm.getTime() > paperTokenValidityPeriod) {
      // token已过期
      ThrowBadRequestResponseTypeError(
        ResponseTypes.INVALID_EXAM_PAPER_TOKEN,
        token,
      );
    }
  }
}

module.exports = {
  paperService: new PaperService(),
};
