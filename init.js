const logger = require('./nkcModules/logger');
async function InitDefaultData() {
  logger.info(`初始化默认数据...`);
  const defaultData = require('./defaultData');
  await defaultData.init();
  logger.info(`完成`);
}

async function InitOperations() {
  logger.info('初始化管理员权限...');
  const { DynamicOperations } = require('./settings/operations.js');
  // 运维包含所有的操作权限
  const operationsId = Object.values(DynamicOperations);
  const { RoleModel, ForumModel } = require('./dataModels');
  await RoleModel.updateOne(
    { _id: 'dev' },
    { $set: { operationsId: operationsId } },
  );
  await ForumModel.updateMany({}, { $addToSet: { rolesId: 'dev' } });
  logger.info(`完成`);
}

async function InitCache() {
  logger.info(`初始化缓存...`);
  const cacheBaseInfo = require('./redis/cache');
  await cacheBaseInfo();
  logger.info(`完成`);
}

InitDefaultData()
  .then(() => {
    return InitOperations();
  })
  .then(() => {
    return InitCache();
  })
  .then(() => {
    logger.info(`初始化完成`);
    process.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    logger.error('初始化失败');
  });
