const fs = require('fs');
if(!fs.existsSync('./install/install.lock')) {
  return require('./install/server.js')
}


require('./global');

require('colors');
const http = require('http'),
  app = require('./app'),
  searchInit = require('./searchInit'),
  settings = require('./settings'),
  serverConfig = require('./config/server'),
  cacheForums = require('./redis/cacheForums'),
  socket = require('./socket'),
  {updateDate, upload} = settings,
  {
    RoleModel,
    ForumModel,
    OperationModel
  } = require('./dataModels');

let server;

const dataInit = async () => {
  if(global.NKC.NODE_ENV !== 'production') {
    const defaultData = require('./defaultData');
    await defaultData.init();
  }
  // 运维包含所有的操作权限
  const operations = await OperationModel.find({}, {_id: 1});
  const operationsId = operations.map(o => o._id);
  await RoleModel.update({_id: 'dev'}, {$set: {operationsId: operationsId}});
  await ForumModel.updateMany({}, {$addToSet: {rolesId: 'dev'}});
};

const jobsInit = async () => {
  const jobs = require('./scheduleJob');
  jobs.updateActiveUsers(updateDate.updateActiveUsersCronStr);
  jobs.updateForums(updateDate.updateForumsCronStr);
  jobs.backupDatabase();
  jobs.shopOrder();
};


const start = async () => {
  try {
    if(global.NKC.processId === 0) {
      await dataInit();
      await jobsInit();
      await upload.initFolders();
      await cacheForums();
    }
    await searchInit();
    console.log('ElasticSearch is ready...'.green);

    const port = serverConfig.port + global.NKC.processId;
    const address = serverConfig.address;
    server = http.createServer(app);
    server.listen(port, address, async () => {
      await socket(server);
      console.log(`nkc ${global.NKC.NODE_ENV} server listening on ${port}`.green);
    });
  } catch(err) {
    console.error(`error occured when initialize the server.\n${err.stack}`.red);
    process.exit(-1)
  }
};

start();
