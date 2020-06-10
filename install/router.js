const Router = require('koa-router');
const pug = require('pug');
const path = require('path');
const config = require('./config');
const router = new Router();
const fs = require('fs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const ElasticSearch = require('elasticsearch');
const apiFunction = require('../nkcModules/apiFunction');
const redis = require('redis');
const checkString = require('../tools/checkString');
const configPath = path.resolve('./config');
const defaultConfig = require('./defaultConfig');
const createFile = global.NKC.createFile;

router
  .use('/', async (ctx, next) => {
    if(fs.existsSync(path.resolve(__dirname, './install.lock'))) {
      ctx.throw(500, '网站已经安装过了，若需重新安装请先移除文件./install/install.lock');
    }
    await next();
  })
  .get('/', async (ctx) => {
    const {query} = ctx;
    ctx.body = pug.renderFile(path.resolve('./install/public/index.pug'), {data: {
      config: config,
      step: query.step,
      time: Date.now(),
    }});
  })
  .post('/save', async (ctx, next) => {
    const {body} = ctx;
    const {mongodb, elasticSearch, redis, account, server} = body;
    const {username, password} = account;
    if(!username) ctx.throw(400, '管理员用户名不能为空');
    if(!password) ctx.throw(400, '管理员密码不能为空');
    if(account.password !== account.password2) ctx.throw(400, '两次输入的管理员密码不相同');
    if(checkString.contentLength(username) > 30) ctx.throw(400, '管理员账号用户名不能超过30字节');
    if(!checkString.checkPass(password)) ctx.throw(400, '密码必须包含字母、数字以及符号三者中的至少两者');
    if(password.length < 8) ctx.throw(400, '密码不能小于8位');
    try{
      await checkServer(server);
    } catch(err) {
      ctx.throw(500, `网站服务：${err.message || err}`);
    }
    try{
      await checkMongodb(mongodb);
    } catch(err) {
      ctx.throw(500, `MongoDB: ${err.message || err}`);
    }
    try{
      await checkElasticSearch(elasticSearch, ctx);
    } catch(err) {
      ctx.throw(500, `Elasticsearch: ${err.message || err}`);
    }
    try{
      await checkRedis(redis, ctx);
    } catch(err) {
      ctx.throw(500, `Redis：${err}`);
    }
    // 用户填写的信息验证通过
    // 开始生成各个数据库的配置文件，为下一步创建管理员账号做准备
    // socket
    defaultConfig.push({
      name: 'server',
      data: {
        address: server.address,
        port: server.port,
        domain: `http://127.0.0.1`
      }
    });
    // redis
    defaultConfig.push({
      name: 'redis',
      data: {
        address: redis.address,
        port: redis.port,
        password: redis.password
      }
    });
    // mongodb
    defaultConfig.push({
      name: 'mongodb',
      data: {
        address: mongodb.address,
        port: mongodb.port,
        username: mongodb.username || '',
        password: mongodb.password || '',
        database: mongodb.databaseName,
        backupDir: '',
        backupTime: ''
      }
    });
    // elasticsearch
    defaultConfig.push({
      name: 'elasticSearch',
      data: {
        address: elasticSearch.address,
        port: elasticSearch.port,
        username: elasticSearch.username || '',
        password: elasticSearch.password || '',
        indexName: elasticSearch.indexName,
        analyzer: "ik_max_word",
        searchAnalyzer: "ik_smart"
      }
    });

    for(const c of defaultConfig) {
      createFile(configPath + `/${c.name}.json`, c.data);
    }

    // 连接数据库，生成默认数据
    const db = require('../dataModels');
    const db_ = Object.assign({}, db);

    for(const name in db_) {
      if(!db_.hasOwnProperty(name)) continue;
      console.log(`clearing collection '${name}'`);
      await db_[name].remove({});
    }

    const defaultData = require('../defaultData');
    await defaultData.init();

    // 创建管理员账号
    console.log(`creating the admin account ...`);
    const user = await db.UserModel.createUser({});
    await user.update({certs: ['dev'], username, usernameLowerCase: username.toLowerCase()});
    const passwordObj = apiFunction.newPasswordObject(password);
    await db.UsersPersonalModel.update({password: passwordObj.password, hashType: passwordObj.hashType});
    console.log(`done`);
    const article = require('../defaultData/articles');
    const forum = await db.ForumModel.findOne({parentId: {$ne: ''}}).sort({toc: 1});
    const thread = db.ThreadModel({
      tid: await db.SettingModel.operateSystemID('threads', 1),
      uid: user.uid,
      fid: forum.fid,
      mid: user.uid,
      count: 1,
      remain: 1
    });
    const post = db.PostModel({
      t: article.title,
      c: article.content,
      uid: user.uid,
      fid: forum.fid,
      pid: await db.SettingModel.operateSystemID('posts', 1),
      tid: thread.tid,
      l: 'html'
    });
    thread.oc = post.pid;
    await thread.save();
    await post.save();
    // 添加install.lock文件，若要重新安装则需要先删掉此文件
    fs.writeFileSync(path.resolve(__dirname, './install.lock'), new Date());

    console.log(`\nThe installation is complete`);
    console.log(`\nrun 'pm2 start pm2.config.js' to start the server.`);
    await next();
  });
module.exports = router;



function checkMongodb(data) {
  const {address, port, username, password, databaseName} = data;
  let url, accountStr = '';
  return Promise.resolve()
    .then(() => {
      if(!address || !port) throw '地址或端口不能为空';
      if(!databaseName) throw '数据库名不能为空';
      if(username && !password) throw '请输入密码';
      if(!username && password) throw '请输入用户名';
      if(username && password) {
        accountStr = `${username}:${password}@`;
      }
      url = `mongodb://${accountStr}${address}:${port}/${databaseName}`;
      return new Promise((resolve, reject) => {
        mongoose.connect(url, {
          autoIndex: true,
          poolSize: 50,
          keepAlive: 120,
          useMongoClient: true
        }, async (err) => {
          if(err) return reject(err);
          const collections = await mongoose.connections[0].db.collections();
          if(collections.length !== 0) {
            return reject(new Error(`数据库 "${databaseName}" 已存在，请更换数据库名。`));
          }
          resolve();
        });
      });
    })
}

function checkElasticSearch(data) {
  let {address, port, username, password, indexName} = data;
  if(!address || !port) throw  '地址和端口不能为空';
  if(!indexName) throw '索引名不能为空';
  if(username && !password) throw '请输入密码';
  if(!username && password) throw '请输入用户名';
  const options = {
    host: `${address}:${port}`
  };
  if(username && password) {
    options.httpAuth = `${username}:${password}`;
  }
  let client;
  client = new ElasticSearch.Client(options);
  return new Promise((resolve, reject) => {
    client.ping({
      requestTimeout: 3000
    }, function(err) {
      if(err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function checkRedis(data) {
  let {address, port, password} = data;
  if(!address || !port) throw '地址和端口不能为空';
  const options = {
    host: address,
    port
  };
  if(password) options.password = password;
  return new Promise((resolve, reject) => {
    try{
      const r = redis.createClient(options);
      r.on('error', (err) => {
        reject(err);
      });
      r.set('ping', 1, () => {
        resolve();
      });
    } catch(err) {
      reject(err);
    }
  });
}

function checkServer(data) {
  return Promise.resolve()
    .then(() => {
      if(!data.address || !data.port) throw '地址或端口不能为空';
    })
}
