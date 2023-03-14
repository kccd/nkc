require('./global');
async function InitDefaultData() {
  console.log(`初始化默认数据...`);
  const defaultData = require('./defaultData');
  await defaultData.init();
  console.log(`完成`);
}

async function InitOperations() {
  console.log('初始化管理员权限...');
  const permission = require('./nkcModules/permission');
  // 运维包含所有的操作权限
  const operationsId = permission.getOperationsId();
  const { RoleModel, ForumModel } = require('./dataModels');
  await RoleModel.updateOne(
    { _id: 'dev' },
    { $set: { operationsId: operationsId } },
  );
  await ForumModel.updateMany({}, { $addToSet: { rolesId: 'dev' } });
  console.log(`完成`);
}

async function InitCache() {
  console.log(`初始化缓存...`);
  const cacheBaseInfo = require('./redis/cache');
  await cacheBaseInfo();
  console.log(`完成`);
}

InitDefaultData()
  .then(() => {
    return InitOperations();
  })
  .then(() => {
    return InitCache();
  })
  .then(() => {
    console.log(`初始化完成`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    console.error('初始化失败');
  });
