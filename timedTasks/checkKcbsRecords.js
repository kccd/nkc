const {
  KcbsRecordModel,
  UserModel,
  UsersGeneralModel
} = require("../dataModels");

const getKcb = async (uid, latestRecordId) => {
  const fromRecords = await KcbsRecordModel.aggregate([
    {
      $match: {
        _id: {
          $lte: latestRecordId
        },
        from: uid,
        verify: true
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$num"
        }
      }
    }
  ]);
  const toRecords = await KcbsRecordModel.aggregate([
    {
      $match: {
        _id: {
          $lte: latestRecordId
        },
        to: uid,
        verify: true
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$num"
        }
      }
    }
  ]);
  const expenses = fromRecords.length? fromRecords[0].total: 0;
  const income = toRecords.length? toRecords[0].total: 0;
  return income - expenses;
};

(async () => {
  const usersCount = await UserModel.countDocuments();
  let num = 0;
  const limit = 1000;
  console.log(`正在核对用户kcb记录`);
  while(num <= usersCount) {
    
    const users = await UserModel.find({}, {uid: 1}).sort({toc: 1}).skip(num).limit(limit);
    
    await Promise.all(users.map(async user => {
      const {uid} = user;
      const userGeneral = await UsersGeneralModel.findOne({uid});
      if(!userGeneral) return;
      if(!userGeneral.kcbSettings.recordId) {
        userGeneral.kcbSettings.recordId = -1;
        userGeneral.kcbSettings.total = 0;
        userGeneral.kcbSettings.diff = false;
        await userGeneral.updateOne({
          $set: {
            kcbSettings: userGeneral.kcbSettings
          }
        });
      }
      if(userGeneral.kcbSettings.diff) return;
      // 核对
      const {recordId, total} = userGeneral.kcbSettings;
      const totalNew = await getKcb(user.uid, recordId);
      if(totalNew !== total) {
        // 存在差异
        await userGeneral.updateOne({
          $set: {
            "kcbSettings.diff": true,
            "kcbSettings.totalNew": totalNew,
            "kcbSettings.time": Date.now()
          }
        });
        return;
      }
      const latestRecord = await KcbsRecordModel.findOne({
        verify: true,
        $or: [
          {
            from: uid
          },
          {
            to: uid
          }
        ]
      }).sort({toc: -1});
      if(!latestRecord) return;
      const latestRecordId = latestRecord._id;
      // 统计该条记录之前的
      const totalLatest = await getKcb(user.uid, latestRecordId);
      await userGeneral.updateOne({
        $set: {
          "kcbSettings.recordId": latestRecordId,
          "kcbSettings.total": totalLatest,
          "kcbSettings.diff": false,
          "kcbSettings.time": Date.now()
        }
      });
    }));
    console.log(`核对用户科创币记录 总：${usersCount}, 当前：${num} - ${num+limit}`);
    num += limit;
  }
  console.log(`所有用户科创币记录核对完成`);
  process.exit(0);
})();