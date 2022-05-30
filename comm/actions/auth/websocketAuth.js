const Cookie = require('../../../nkcModules/cookie');
const {
  HttpErrorCodes,
  HttpErrorTypes,
  ThrowError,
} = require('../../../nkcModules/error');
const UserModel = require('../../../dataModels/UserModel');
const MessageModel = require("../../../dataModels/MessageModel");
const UsersGenerals = require("../../../dataModels/UsersGeneralModel");
const SettingModel = require("../../../dataModels/SettingModel");

module.exports = {
  params: {
    cookie: 'string',
    operationId: 'string',
    os: 'string'
  },
  async handler(ctx) {
    const {cookie, operationId, os} = ctx.params;
    const userInfo = Cookie.getUserInfo(cookie);
    if(!userInfo) {
      ThrowError(HttpErrorCodes.BadRequest, HttpErrorTypes.ERR_INVALID_COOKIE);
    }
    const user = await UserModel.findOnly({uid: userInfo.uid});
    const operationsId = await user.getUserOperationsId();
    if(!operationsId.includes(operationId)) {
      ThrowError(HttpErrorCodes.Forbidden, HttpErrorTypes.ERR_FORBIDDEN);
    }
    const onlineStatus = await user.setOnlineStatus(os);
    const {
      newSystemInfoCount,
      newApplicationsCount,
      newReminderCount,
      newUsersMessagesCount
    } = await user.getNewMessagesCount();
    const newMessageCount = newSystemInfoCount + newApplicationsCount + newReminderCount + newUsersMessagesCount;
    const friendsUid = await MessageModel.getUsersFriendsUid(user.uid);

    let {lotterySettings: {status, close}} = await UsersGenerals.findOne({uid: user.uid}, {lotterySettings: 1})
    const redEnvelopeSettings = await SettingModel.getSettings('redEnvelope');
    let redEnvelopeStatus = false;
    if (status && !close && !redEnvelopeSettings.random.close) {
      redEnvelopeStatus = true;
    }
    return {
      uid: user.uid,
      onlineStatus,
      friendsUid,
      newMessageCount,
      redEnvelopeStatus
    }
  }
};
