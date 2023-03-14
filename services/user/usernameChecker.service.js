const {
  sensitiveDetectionService,
} = require('../sensitive/sensitiveDetection.service');
const { contentLength } = require('../../tools/checkString');
const {
  UserModel,
  ColumnModel,
  SecretBehaviorModel,
} = require('../../dataModels');
const { ResponseTypes } = require('../../settings/response');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { usernameRegex } = require('../../settings/regex');
class UsernameCheckerService {
  /**
   检查给定用户名的格式是否有效。
   @param {string} username - 要检查的用户名。
   @throws {BadRequestResponseTypeError} 如果用户名长度无效或用户名格式无效。
   @returns {Promise<void>}
   */
  async #checkUsernameFormat(username) {
    const length = contentLength(username);
    const minLength = 1;
    const maxLength = 30;
    if (length < minLength || length > maxLength) {
      ThrowBadRequestResponseTypeError(ResponseTypes.USERNAME_LENGTH_ERROR, [
        minLength,
        maxLength,
      ]);
    }
    if (!usernameRegex.test(username)) {
      ThrowBadRequestResponseTypeError(ResponseTypes.USERNAME_FORMAT_ERROR);
    }
  }

  /**
   检查给定的用户名是否包含敏感内容。
   @param {string} username - 要检查的用户名。
   @returns {Promise<void>}
   */
  async checkUsernameSensitiveContent(username) {
    await sensitiveDetectionService.usernameDetection(username);
  }

  /**
   检查给定的用户名是否与数据库中已有的用户名相同。
   @param {string} username - 要检查的用户名。
   @param {string} [ignoredUid=''] - 要忽略的用户 ID。
   @throws {BadRequestResponseTypeError} 如果该用户名已经存在于用户、专栏或操作记录中，则抛出 BadRequestResponseTypeError 异常。
   @returns {Promise<void>}
   */
  async #checkSameUsername(username = '', ignoredUid = '') {
    const usernameLowerCase = username.toLowerCase();
    const sameUser = await UserModel.findOne(
      { usernameLowerCase: usernameLowerCase, uid: { $ne: ignoredUid } },
      { uid: 1 },
    );
    if (sameUser) {
      ThrowBadRequestResponseTypeError(ResponseTypes.USERNAME_EXISTS_ERROR);
    }
    const sameColumn = await ColumnModel.findOne(
      { nameLowerCase: usernameLowerCase },
      { _id: 1 },
    );
    if (sameColumn) {
      ThrowBadRequestResponseTypeError(ResponseTypes.USERNAME_EXISTS_ERROR);
    }
    const sameLog = await SecretBehaviorModel.findOne(
      {
        type: { $in: ['modifyUsername', 'destroy'] },
        oldUsernameLowerCase: usernameLowerCase,
        toc: { $gt: Date.now() - 365 * 24 * 60 * 60 * 1000 },
      },
      { _id: 1, uid: 1 },
    ).sort({ toc: -1 });
    if (sameLog && sameLog.uid !== ignoredUid) {
      ThrowBadRequestResponseTypeError(ResponseTypes.USERNAME_EXISTS_ERROR);
    }
  }

  /**
   通过检查用户名的格式、敏感内容和是否已存在于其他用户中，检查新用户名是否有效。
   @param {string} username - 要检查的用户名。
   @param {string} ignoredUid - 在检查相同用户名时要忽略的用户ID。
   @returns {Promise<void>}
   */
  async checkNewUsername(username, ignoredUid = '') {
    await this.#checkUsernameFormat(username);
    await this.checkUsernameSensitiveContent(username);
    await this.#checkSameUsername(username, ignoredUid);
  }
}

module.exports = {
  usernameCheckerService: new UsernameCheckerService(),
};
