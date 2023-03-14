const UserModel = require('../../dataModels/UserModel');
class UserInfoService {
  async getUsersBaseInfoObjectByUserIds(userIds) {
    const users = await UserModel.find(
      { uid: { $in: userIds } },
      { uid: 1, username: 1 },
    );
    const usersObj = {};
    for (const user of users) {
      usersObj[user.uid] = user;
    }
    return usersObj;
  }
}

module.exports = {
  userInfoService: new UserInfoService(),
};
