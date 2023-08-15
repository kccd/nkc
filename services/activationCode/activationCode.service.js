const { getActivationCodeLock } = require('../../nkcModules/redLock');
const randomize = require('randomatic');
const {
  ThrowServerInternalError,
  ThrowBadRequestResponseTypeError,
} = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const ActivationCodeModel = require('../../dataModels/ActivationCodeModel');

class ActivationCodeService {
  async getNewActivationCodeId() {
    const lock = await getActivationCodeLock();
    for (let i = 10; i > 0; i--) {
      const codeId = randomize('A0', 64);
      const activationCode = await ActivationCodeModel.findOne(
        { _id: codeId },
        { _id: 1 },
      );
      if (!activationCode) {
        await lock.unlock();
        return codeId;
      }
    }
    await lock.unlock();
    ThrowServerInternalError(`Activation code is not enough to allocate`);
  }

  async getActivationCodeByCode(codeId) {
    const activationCode = await ActivationCodeModel.findOne({ _id: codeId });
    if (!activationCode) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.INVALID_ACTIVATION_CODE_ID,
        [codeId],
      );
    }
    return activationCode;
  }

  async checkActivationCodeId(codeId) {
    const now = Date.now();
    if (!codeId) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.INVALID_ACTIVATION_CODE_ID,
        codeId,
      );
    }
    const activationCode = await ActivationCodeModel.findOne({ _id: codeId });
    if (!activationCode) {
      // code不存在
      ThrowBadRequestResponseTypeError(
        ResponseTypes.INVALID_ACTIVATION_CODE_ID,
        codeId,
      );
    }
    if (activationCode.used) {
      // code已被使用
      ThrowBadRequestResponseTypeError(
        ResponseTypes.INVALID_ACTIVATION_CODE_ID,
        codeId,
      );
    }
    if (now > activationCode.expiration) {
      // code已过期
      ThrowBadRequestResponseTypeError(
        ResponseTypes.INVALID_ACTIVATION_CODE_ID,
        codeId,
      );
    }
  }

  async createActivationCode(props) {
    const { source, sid, expiration } = props;
    const codeId = await this.getNewActivationCodeId();
    const activationCode = new ActivationCodeModel({
      _id: codeId,
      toc: new Date(),
      used: false,
      source,
      sid,
      uid: '',
      expiration,
    });
    await activationCode.save();
    return activationCode;
  }

  async useActivationCode(codeId, uid) {
    const activationCode = await this.getActivationCodeByCode(codeId);
    await ActivationCodeModel.updateOne(
      {
        _id: activationCode._id,
      },
      {
        $set: {
          uid,
          used: true,
          timeOfUse: new Date(),
        },
      },
    );
  }
}

module.exports = {
  activationCodeService: new ActivationCodeService(),
};
