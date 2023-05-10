const SensitiveCheckerLogModel = require('../../dataModels/SensitiveCheckerLogModel');
const { defaultCerts } = require('../../settings/userCerts');
const UserModel = require('../../dataModels/UserModel');
const ColumnModel = require('../../dataModels/ColumnModel');
const { userInfoService } = require('../user/userInfo.service');
const { getUrl } = require('../../nkcModules/tools');
const apiFunction = require('../../nkcModules/apiFunction');
const {
  translateSensitiveSettingName,
  translateSensitiveCheckerStatus,
} = require('../../nkcModules/translate');
const path = require('path');
const { Eve } = require('node-threads-pool');
const { sensitiveCheckerStatus } = require('../../settings/sensitiveChecker');
const { sensitiveTypes } = require('../../settings/sensitiveSetting');
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
  async getSensitiveCheckerLogs(page) {
    const count = await SensitiveCheckerLogModel.countDocuments();
    const paging = apiFunction.paging(page, count);
    const checkerLogs = await SensitiveCheckerLogModel.find({})
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const logs = await this.extendSensitiveCheckerLog(checkerLogs);
    return {
      paging,
      logs,
    };
  }

  async extendSensitiveCheckerLog(logs) {
    const targetLogs = [];
    const userIds = [];
    for (const log of logs) {
      userIds.push(log.uid);
    }
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds(
      userIds,
    );
    for (const log of logs) {
      const { toc, tlm, uid, type, status, targetIds, progress, error } = log;
      const user = usersObject[uid];
      targetLogs.push({
        _id: log._id,
        toc,
        tlm,
        user,
        type,
        typeName: translateSensitiveSettingName('zh_cn', type),
        status,
        statusName: translateSensitiveCheckerStatus('zh_cn', status),
        targetCount: targetIds.length,
        progress,
        error,
      });
    }
    return targetLogs;
  }

  async getSensitiveCheckerLogResultById(id, page = 0, perPage = 100) {
    const originLog = await SensitiveCheckerLogModel.findOnly({ _id: id });
    const log = (await this.extendSensitiveCheckerLog([originLog]))[0];
    const { type } = log;
    const paging = apiFunction.paging(
      page,
      originLog.targetIds.length,
      perPage,
    );
    const targetIds = originLog.targetIds.slice(
      paging.start,
      paging.start + paging.perpage,
    );
    const results = [];
    switch (type) {
      case sensitiveTypes.username:
      case sensitiveTypes.userDesc: {
        const users = await this.getLogUsersByTargetIds(targetIds);
        for (const user of users) {
          results.push({
            targetBanned: user.banned,
            targetUrl: getUrl('userHome', user.uid),
            targetId: user.uid,
            targetContent:
              sensitiveTypes.username === type
                ? user.username
                : user.description,
          });
        }
        break;
      }

      case sensitiveTypes.columnName:
      case sensitiveTypes.columnAbbr: {
        const columns = await this.getLogColumnsByTargetIds(targetIds);
        for (const column of columns) {
          results.push({
            targetBanned: false,
            targetUrl: getUrl('columnHome', column._id),
            targetId: column._id,
            targetContent:
              sensitiveTypes.columnName === type
                ? column.name
                : column.description,
          });
        }
        break;
      }

      default:
        break;
    }
    return {
      log,
      results,
      paging,
    };
  }

  async getLogColumnsByTargetIds(targetIds) {
    const columns = await ColumnModel.find(
      { _id: { $in: targetIds } },
      {
        _id: 1,
        name: 1,
        description: 1,
      },
    );
    return columns.map((c) => ({
      _id: c._id,
      name: c.name,
      description: c.description,
    }));
  }

  async getLogUsersByTargetIds(targetIds) {
    const users = await UserModel.find(
      { uid: { $in: targetIds } },
      {
        uid: 1,
        username: 1,
        description: 1,
        certs: 1,
      },
    );
    return users.map((u) => ({
      uid: u.uid,
      username: u.username,
      description: u.description,
      banned: u.certs.includes(defaultCerts.banned),
    }));
  }

  async setAllCheckerLogStatusToFailed() {
    await SensitiveCheckerLogModel.updateMany(
      {
        status: sensitiveCheckerStatus.running,
      },
      {
        $set: {
          status: sensitiveCheckerStatus.failed,
          tlm: new Date(),
          error: '项目启动时将所有正在运行的检测记录标记为检测失败',
        },
      },
    );
  }

  async clearSensitiveContentByTargetIds(props) {
    const { ip, port, targets } = props;
    for (const target of targets) {
      const { type, targetId } = target;
      switch (type) {
        case sensitiveTypes.username: {
          await UserModel.clearUsername({
            uid: targetId,
            ip,
            port,
          });
          break;
        }
        case sensitiveTypes.userDesc: {
          await UserModel.clearUserDescription(targetId);
          break;
        }
        case sensitiveTypes.columnName: {
          await ColumnModel.clearColumnName(targetId);
          break;
        }
        case sensitiveTypes.columnAbbr: {
          await ColumnModel.clearColumnAbbr(targetId);
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  async clearSensitiveContentByLogId(props) {
    const { ip, port, logId } = props;
    const log = await SensitiveCheckerLogModel.findOnly({ _id: logId });
    const targetIds = log.targetIds;
    const targets = targetIds.map((targetId) => {
      return {
        type: log.type,
        targetId,
      };
    });
    await this.clearSensitiveContentByTargetIds({
      ip,
      port,
      targets,
    });
  }
}

module.exports = {
  sensitiveCheckerService: new SensitiveCheckerService(),
};
