const { Thread } = require('node-threads-pool');
const {
  SensitiveCheckerLogModel,
  ColumnModel,
  UserModel,
} = require('../../dataModels');
const { sensitiveTypes } = require('../../settings/sensitiveSetting');
const { sensitiveDetectionService } = require('./sensitiveDetection.service');
const logger = require('../../nkcModules/logger');
new Thread(main);

async function main(data) {
  try {
    const { logId } = data;
    const checkerLog = await SensitiveCheckerLogModel.getLogById(logId);
    switch (checkerLog.type) {
      case sensitiveTypes.username: {
        await usernameChecker(checkerLog);
        break;
      }
      case sensitiveTypes.userDesc: {
        await userDescChecker(checkerLog);
        break;
      }
      case sensitiveTypes.columnName: {
        await columnNameChecker(checkerLog);
        break;
      }
      case sensitiveTypes.columnAbbr: {
        await columnAbbrChecker(checkerLog);
        break;
      }
      default: {
        break;
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function usernameChecker(checkerLog) {
  return checker({
    checkerLog,
    limit: 100,
    model: UserModel,
    contentKey: 'username',
    idKey: 'uid',
    sortKey: 'toc',
  });
}

async function userDescChecker(checkerLog) {
  return checker({
    checkerLog,
    limit: 100,
    model: UserModel,
    contentKey: 'description',
    idKey: 'uid',
    sortKey: 'toc',
  });
}

async function columnNameChecker(checkerLog) {
  return checker({
    checkerLog,
    limit: 100,
    model: ColumnModel,
    contentKey: 'name',
    idKey: '_id',
    sortKey: 'toc',
  });
}

async function columnAbbrChecker(checkerLog) {
  return checker({
    checkerLog,
    limit: 100,
    model: ColumnModel,
    contentKey: 'abbr',
    idKey: '_id',
    sortKey: 'toc',
  });
}

async function checker(props) {
  const {
    checkerLog,
    limit = 100,
    model,
    contentKey,
    idKey,
    sortKey = 'toc',
  } = props;
  try {
    const count = await model.countDocuments();
    for (let i = 0; i <= count; i += limit) {
      const targetIds = [];
      const filter = {};
      filter[contentKey] = 1;
      filter[idKey] = 1;
      const sort = {};
      sort[sortKey] = 1;
      const arr = await model.find({}, filter).sort(sort).skip(i).limit(limit);
      const content = arr.map((a) => a[contentKey]).join(',');
      const isSensitiveContent =
        await sensitiveDetectionService.isSensitiveContentByType(
          checkerLog.type,
          content,
        );
      if (isSensitiveContent) {
        for (const item of arr) {
          const isSensitiveContent =
            await sensitiveDetectionService.isSensitiveContentByType(
              checkerLog.type,
              item[contentKey],
            );
          if (isSensitiveContent) {
            targetIds.push(item[idKey]);
          }
        }
      }
      const currentCount = i + limit > count ? count : i + limit;
      const progress = Math.round((currentCount * 100) / count) / 100;
      logger.info(
        `Sensitive checker ${checkerLog.type} progress: ${Math.round(
          progress * 100,
        )}%`,
      );
      await checkerLog.updateLogProgress(progress, targetIds);
    }
    await checkerLog.updateLogStatusToSucceeded();
    logger.info(`Sensitive checker ${checkerLog.type} successfully`);
  } catch (err) {
    await checkerLog.updateLogStatusToFailed(err.stack || err.toString());
    logger.error(`Sensitive checker ${checkerLog.type} failed`);
  }
}
