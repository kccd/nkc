const UserMemoModel = require('../../dataModels/UserMemoModel');
const checkData = require('../../nkcModules/checkData');
class UserMemoService {
  async checkNicknameFormat(nickname) {
    checkData.checkString(nickname, {
      name: '提示信息',
      minLength: 0,
      maxLength: 30,
    });
  }

  async checkDescFormat(desc) {
    checkData.checkString(desc, {
      name: '描述',
      minLength: 0,
      maxLength: 500,
    });
  }

  async setUserMemo(props) {
    const { uid, tUid, nickname = '', desc = '' } = props;
    let memo = await UserMemoModel.findOne({ uid, tUid }, { _id: 1 });
    if (memo) {
      await memo.updateOne({
        $set: {
          nickname,
          desc,
        },
      });
    } else {
      memo = new UserMemoModel({
        uid,
        tUid,
        nickname,
        desc,
      });
      await memo.save();
    }
  }

  async getUserMemo(props) {
    const { uid, tUid } = props;
    return UserMemoModel.findOne(
      { uid, tUid },
      {
        uid: 1,
        tUid: 1,
        nickname: 1,
        desc: 1,
      },
    );
  }

  async getUsersNicknameObject(props) {
    const { uid, targetUsersId } = props;
    const memos = await UserMemoModel.find(
      {
        uid,
        tUid: { $in: targetUsersId },
      },
      {
        nickname: 1,
        tUid: 1,
      },
    );
    const nicknameObject = {};
    for (const memo of memos) {
      nicknameObject[memo.tUid] = memo.nickname;
    }
    return nicknameObject;
  }
}

module.exports = {
  userMemoService: new UserMemoService(),
};
