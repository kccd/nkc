const SensitiveCheckerLogModel = require('../../dataModels/SensitiveCheckerLogModel');
const { userInfoService } = require('../user/userInfo.service');
const apiFunction = require('../../nkcModules/apiFunction');
const path = require('path');
const { Eve } = require('node-threads-pool');
const { sensitiveCheckerStatus } = require('../../settings/sensitiveChecker');
class SensitiveCheckerService {
  #checkerThread = new Eve(
    path.resolve(__dirname, './sensitiveChecker.thread.js'),
    2,
  );
  async #createNewCheckerLog(props) {
    const { uid, type } = props;
    const log = new SensitiveCheckerLogModel({
      toc: new Date(),
      uid,
      type,
      status: sensitiveCheckerStatus.running,
    });
    await log.save();
    return log;
  }

  async runNewCheck(type, uid) {
    const log = await this.#createNewCheckerLog({
      uid,
      type,
    });
    this.#checkerThread
      .run({
        logId: log._id.toString(),
      })
      .catch(console.error);
  }

  /*async getSensitiveCheckerLogs(page) {
    const count = await SensitiveCheckerLogModel.countDocuments();
    const paging = apiFunction.paging(page, count);
    const checkerLogs = await SensitiveCheckerLogModel.find({})
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const userIds = [];
    for (const log of checkerLogs) {
      userIds.push(log.uid);
    }
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds(
      userIds,
    );
    const logs = [];
    for (const log in checkerLogs) {
      const { toc, tlm, uid, type, status, targetIds, progress, error } = log;
      const user = usersObject[uid];
    }
  }*/
}

module.exports = {
  sensitiveCheckerService: new SensitiveCheckerService(),
};
