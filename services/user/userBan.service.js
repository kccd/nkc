const UserModel = require('../../dataModels/UserModel');
const ManageBehaviorModel = require('../../dataModels/ManageBehaviorModel');
const { defaultCerts } = require('../../settings/userCerts');
class UserBanService {
  async banUsersByUserIds(props) {
    const { adminId, userIds, reason = '', ip, port } = props;
    await UserModel.updateMany(
      { uid: { $in: userIds } },
      { $addToSet: { certs: defaultCerts.banned } },
    );
    const logs = [];
    const toc = new Date();
    for (const targetUid of userIds) {
      const log = new ManageBehaviorModel({
        uid: adminId,
        toUid: targetUid,
        operationId: 'bannedUser',
        toc,
        ip,
        port,
        desc: reason,
      });
      logs.push(log);
    }
    await ManageBehaviorModel.create(logs);
  }

  async unBanUsersByUserIds(props) {
    const { adminId, userIds, reason = '', ip, port } = props;
    await UserModel.updateMany(
      { uid: { $in: userIds } },
      { $pull: { certs: defaultCerts.banned } },
    );
    const logs = [];
    const toc = new Date();
    for (const targetUid of userIds) {
      const log = new ManageBehaviorModel({
        uid: adminId,
        toUid: targetUid,
        operationId: 'unBannedUser',
        toc,
        ip,
        port,
        desc: reason,
      });
      logs.push(log);
    }
    await ManageBehaviorModel.create(logs);
  }
}

module.exports = {
  userBanService: new UserBanService(),
};
