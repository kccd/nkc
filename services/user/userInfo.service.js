const UserModel = require('../../dataModels/UserModel');
const { defaultCerts } = require('../../settings/userCerts');
const nkcRender = require('../../nkcModules/nkcRender');
class UserInfoService {
  async getUsersBaseInfoObjectByUserIdsCore(props) {
    const { userIds, bannedUsersIgnored } = props;
    const match = {
      uid: { $in: userIds },
    };
    if (bannedUsersIgnored) {
      match.certs = { $ne: defaultCerts.banned };
      match.hidden = false;
    }
    const users = await UserModel.find(match, {
      uid: 1,
      username: 1,
      avatar: 1,
      description: 1,
      certs: 1,
    });
    const usersObj = {};
    for (const user of users) {
      const { uid, username, avatar, description } = user;
      usersObj[user.uid] = {
        uid,
        username,
        avatar,
        description: nkcRender.replaceLink(description),
      };
    }
    return usersObj;
  }
  async getUsersBaseInfoObjectByUserIds(userIds) {
    return await this.getUsersBaseInfoObjectByUserIdsCore({
      userIds,
      bannedUsersIgnored: false,
    });
  }

  async getUnbannedUsersBaseInfoObjectByUserIds(userIds) {
    return await this.getUsersBaseInfoObjectByUserIdsCore({
      userIds,
      bannedUsersIgnored: true,
    });
  }
}

module.exports = {
  userInfoService: new UserInfoService(),
};
