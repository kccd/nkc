const BlacklistModel = require('../../dataModels/BlacklistModel');
const { ThrowCommonError } = require('../../nkcModules/error');
class BlacklistCheckerService {
  // 判断某人是否拉黑了某人
  // uid 执行拉黑的人，tUid 被拉黑的人
  inBlacklist = async (uid, tUid) => {
    return await BlacklistModel.inBlacklist(uid, tUid);
  };

  // 判断两个用户能否进行互动操作
  // 任何一方将对方加入到黑名单后，应禁止两人的互动
  checkInteractPermission = async (uid, tUid) => {
    if (await this.inBlacklist(uid, tUid)) {
      ThrowCommonError(403, '对方在您的黑名单中，无法执行当前操作。');
    } else if (await this.inBlacklist(tUid, uid)) {
      ThrowCommonError(403, '您在对方的黑名单中，无法执行当前操作。');
    }
  };
}

module.exports = {
  blacklistCheckerService: new BlacklistCheckerService(),
};
