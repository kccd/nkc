const http = require('http');
const https = require('https');
const app = require('./app');
const searchInit = require('./searchInit');
const settings = require('./settings');
const nkcModules = require('./nkcModules');
const fs = require('fs');
const path = require('path');
const {useHttps, updateDate} = settings;

let server;
let redirectServer;

searchInit()
  .then(async () => {
    console.log('ElasticSearch is ready...'.green);


	  global.NKC = {};
	  global.NKC.NODE_ENV = (process.env.NODE_ENV === 'production')? process.env.NODE_ENV: 'development';


    // 检测数据的完整性
		// 初始化网站配置
    const {SettingModel, RoleModel, OperationModel, OperationTypeModel} = require('./dataModels');
    const defaultData = require('./settings/defaultSettings');
    await Promise.all(defaultData.map(async settings => {
			const settingsDB = await SettingModel.findOne({type: settings.type});
			if(!settingsDB) {
				console.log(`Initialize settings -${settings.type}`);
				const newSettings = SettingModel(settings);
				await newSettings.save();
			}
    }));

		// 初始化角色
    const defaultRoles = require('./settings/defaultRoles');
    for(let role of defaultRoles) {
	    const roleDB = await RoleModel.findOne({_id: role._id});
	    if(!roleDB) {
		    console.log(`Initialize role - ${role._id}`);
		    const newRole = RoleModel(role);
		    await newRole.save();
	    }
    }

	  const serverSettings = await SettingModel.findOnly({type: 'server'});

	  // 加载语言文件
	  const languageFilePath = path.resolve('./languages/' + serverSettings.language + '.json');
	  const languageFileContent = fs.readFileSync(languageFilePath);
	  const language = JSON.parse(languageFileContent);

		// 初始化操作类型,让数据库的数据与operationTree同步
    const operationsId = nkcModules.permission.getOperationsId();
    for(let operationId of operationsId) {
	    const operationDB = await OperationModel.findOne({_id: operationId});
	    if(!operationDB) {
		    console.log(`Initialize operation - ${operationId}`);
		    const newOperation = OperationModel({
			    _id: operationId,
			    description: language.content[operationId] || operationId,
			    errInfo: '权限不足'
		    });
		    await newOperation.save();
	    }
    }

    // 删掉无用的operation
	  const operationsDB = await OperationModel.find({});
    for(let operation of operationsDB) {
    	if(!operationsId.includes(operation._id)) {
    		console.log(`delete operation - ${operation._id}`);
    		await operation.remove();
	    }
    }

    // 运维包含所有的操作权限
    await RoleModel.update({_id: 'dev'}, {$set: {operationsId: operationsId}});

    // 初始化默认操作
	  const defaultOperationTypes = require('./settings/defaultOperaionTypes');
	  for(const operationType of defaultOperationTypes) {
	  	const operationTypeDB = await OperationTypeModel.findOne({type: operationType.type});
	  	if(!operationTypeDB) {
	  		console.log(`Initialize operationType - ${operationType.type}`);
			  operationType._id = await SettingModel.operateSystemID('operationTypes', 1);
	  		const newType = OperationTypeModel(operationType);
	  		await newType.save();
		  }
	  }


    const jobs = require('./scheduleJob');
    jobs.updateActiveUsers(updateDate.updateActiveUsersCronStr);
    jobs.updateForums(updateDate.updateForumsCronStr);
    if(serverSettings.useHttps || useHttps) {
      const httpsOptions = settings.httpsOptions();
      server = https.Server(httpsOptions, app)
        .listen(
          serverSettings.httpsPort,
          serverSettings.address,
          () => console.log(`${serverSettings.serverName} listening on ${serverSettings.address}:${serverSettings.httpsPort}`.green)
        );

      redirectServer = http.createServer((req, res) => {
        const host = req.headers['host'];
        res.writeHead(301, {
          'Location': 'https://' + host + req.url
        });
        res.end();
      })
        .listen(serverSettings.port, serverSettings.address);
    } else {
      server = http.createServer(app).listen(
        serverSettings.port,
        serverSettings.address,
        () => console.log(`${serverSettings.serverName} listening on ${serverSettings.address}:${serverSettings.port}`.green)
      );
    }
  })
  .catch(e => {
    console.error(`error occured when initialize the server.\n${e.stack}`.red);
    process.exit(-1)
  });


