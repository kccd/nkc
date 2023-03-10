const { contentLength } = require('../../tools/checkString');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const {
  sensitiveDetectionService,
} = require('../review/sensitiveDetection.service');

class ColumnAbbrCheckerService {
  async #checkColumnAbbrFormat(desc = '') {
    const length = contentLength(desc);
    const minLength = 0;
    const maxLength = 120;
    if (length < minLength || length > maxLength) {
      ThrowBadRequestResponseTypeError(ResponseTypes.COLUMN_DESC_LENGTH_ERROR, [
        minLength,
        maxLength,
      ]);
    }
  }

  async #checkColumnAbbrSensitiveContent(desc = '') {
    await sensitiveDetectionService.columnAbbrDetection(desc);
  }

  async checkColumnAbbr(desc = '') {
    await this.#checkColumnAbbrFormat(desc);
    await this.#checkColumnAbbrSensitiveContent(desc);
  }
}

module.exports = {
  columnAbbrCheckerService: new ColumnAbbrCheckerService(),
};
