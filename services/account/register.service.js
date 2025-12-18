const UserModel = require('../../dataModels/UserModel');
const SettingModel = require('../../dataModels/SettingModel');
const UsersPersonalModel = require('../../dataModels/UsersPersonalModel');
const UsersGeneralModel = require('../../dataModels/UsersGeneralModel');
const { transactionService } = require('../database/transaction');
const apiFunction = require('../../nkcModules/apiFunction');
const {
  subscribeForumService,
} = require('../subscribe/subscribeForum.service');

class RegisterService {
  // 创建用户
  createUser = async (props) => {
    const { ip = '', port = 0, nationCode = '', mobile = '' } = props;
    const toc = new Date();
    const uid = await SettingModel.operateSystemID('users', 1);
    const username = `kc-${uid}`;
    const user = UserModel({
      toc,
      tlv: toc,
      uid,
      certs: [],
      username,
      usernameLowerCase: username.toLowerCase(),
    });
    const usersPersonal = UsersPersonalModel({
      uid,
      nationCode,
      mobile,
      regIP: ip,
      regPort: port,
      secret: [apiFunction.getRandomString('aA0', 64)],
    });
    const usersGeneral = UsersGeneralModel({
      uid,
    });

    await transactionService.withTransaction(async (session) => {
      await user.save({ session });
      await usersPersonal.save({ session });
      await usersGeneral.save({ session });
    });

    const { defaultSubscribeForumsId } = await SettingModel.getSettings(
      'register',
    );

    for (const fid of defaultSubscribeForumsId) {
      await subscribeForumService.subscribeForum(user.uid, fid);
    }

    return user;
  };
}

module.exports = {
  registerService: new RegisterService(),
};
