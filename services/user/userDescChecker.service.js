const { contentLength } = require('../../tools/checkString');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const {
  sensitiveDetectionService,
} = require('../sensitive/sensitiveDetection.service');

class UserDescCheckerService {
  async #checkUserDescFormat(desc = '') {
    const length = contentLength(desc);
    const minLength = 0;
    const maxLength = 500;
    if (length < minLength || length > maxLength) {
      ThrowBadRequestResponseTypeError(ResponseTypes.USER_DESC_LENGTH_ERROR, [
        minLength,
        maxLength,
      ]);
    }
  }

  async #checkUserDescSensitiveContent(desc = '') {
    await sensitiveDetectionService.userDescDetection(desc);
  }

  async checkUserDesc(desc = '') {
    await this.#checkUserDescFormat(desc);
    await this.#checkUserDescSensitiveContent(desc);
  }
}

module.exports = {
  userDescCheckerService: new UserDescCheckerService(),
};
