const UserModel = require('../../dataModels/UserModel');
const { defaultCerts } = require('../../settings/userCerts');
class UserBanService {
  async banUsersByUserIds(userIds) {
    await UserModel.updateMany(
      { uid: { $in: userIds } },
      { $addToSet: { certs: defaultCerts.banned } },
    );
  }

  async unBanUsersByUserIds(userIds) {
    await UserModel.updateMany(
      { uid: { $in: userIds } },
      { $pull: { certs: defaultCerts.banned } },
    );
  }
}

module.exports = {
  userBanService: new UserBanService(),
};
