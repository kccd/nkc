const { contentLength } = require('../../tools/checkString');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const { usernameRegex } = require('../../settings/regex');
const {
  sensitiveDetectionService,
} = require('../sensitive/sensitiveDetection.service');
const {
  ForumModel,
  UserModel,
  ColumnModel,
  SecretBehaviorModel,
} = require('../../dataModels');

class ColumnNameCheckerService {
  async #checkColumnNameFormat(columnName = '') {
    const length = contentLength(columnName);
    const minLength = 1;
    const maxLength = 30;
    if (length < minLength || length > maxLength) {
      ThrowBadRequestResponseTypeError(ResponseTypes.USERNAME_LENGTH_ERROR, [
        minLength,
        maxLength,
      ]);
    }
    if (!usernameRegex.test(columnName)) {
      ThrowBadRequestResponseTypeError(ResponseTypes.USERNAME_FORMAT_ERROR);
    }
  }

  async #checkSameColumnName(columnName = '', ignoredColumnId = '') {
    const columnNameLowerCase = columnName.toLowerCase();
    const sameUser = await UserModel.findOne(
      { usernameLowerCase: columnNameLowerCase },
      { uid: 1 },
    );
    if (sameUser) {
      ThrowBadRequestResponseTypeError(ResponseTypes.COLUMN_NAME_EXISTS_ERROR);
    }
    const sameColumn = await ColumnModel.findOne(
      { nameLowerCase: columnNameLowerCase, _id: { $ne: ignoredColumnId } },
      { _id: 1 },
    );
    if (sameColumn) {
      ThrowBadRequestResponseTypeError(ResponseTypes.COLUMN_NAME_EXISTS_ERROR);
    }
    const sameLog = await SecretBehaviorModel.findOne(
      {
        type: { $in: ['modifyUsername', 'destroy'] },
        oldUsernameLowerCase: columnNameLowerCase,
        toc: { $gt: Date.now() - 365 * 24 * 60 * 60 * 1000 },
      },
      { _id: 1, uid: 1 },
    ).sort({ toc: -1 });
    if (sameLog) {
      ThrowBadRequestResponseTypeError(ResponseTypes.COLUMN_NAME_EXISTS_ERROR);
    }
    const sameForum = await ForumModel.findOne(
      { displayName: { $in: [columnName, columnNameLowerCase] } },
      { fid: 1 },
    );
    if (sameForum) {
      ThrowBadRequestResponseTypeError(ResponseTypes.COLUMN_NAME_EXISTS_ERROR);
    }
  }

  async #checkColumnNameSensitiveContent(columnName = '') {
    await sensitiveDetectionService.columnNameDetection(columnName);
  }

  async checkColumnName(columnName = '', ignoredColumnId = '') {
    await this.#checkColumnNameFormat(columnName);
    await this.#checkColumnNameSensitiveContent(columnName);
    await this.#checkSameColumnName(columnName, ignoredColumnId);
  }
}

module.exports = {
  columnNameCheckerService: new ColumnNameCheckerService(),
};
