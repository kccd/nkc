const childProcess = require('child_process');
const {execSync} = childProcess;
const checkString = require('../tools/checkString');
const path = require('path');
const rootConfigs = ['config.js'];
const fs = require('fs');
const settingsConfigs = [
  'alipaySecret.js',
  'emailSecrets.js',
  'es.js',
  'server.js',
  'smsSecrets.js',
  'backup.js'
];
(async () => {
  try{
    console.log('正在生成配置文件...');
    for(const name of rootConfigs) {
      const oldPath = path.resolve(__dirname, '../install/secretFiles/' + name);
      const newPath = path.resolve(__dirname, '../' + name);
      if(fs.existsSync(newPath)) continue;
      fs.copyFileSync(oldPath, newPath);
    }
    for(const name of settingsConfigs) {
      const oldPath = path.resolve(__dirname, '../install/secretFiles/' + name);
      const newPath = path.resolve(__dirname, '../settings/' + name);
      if(fs.existsSync(newPath)) continue;
      fs.copyFileSync(oldPath, newPath);
    }
    if(!fs.existsSync(path.resolve(__dirname, '../secret.txt'))) {
      const apiFunction = require('../nkcModules/apiFunction');
      const cookieKey = apiFunction.makeRandomCode(256);
      fs.writeFileSync(path.resolve(__dirname, '../secret.txt'), cookieKey);
    }
    console.log(`配置文件已生成`);

    const config = require('./config.js');
    let {username, password, databaseName} = config;
    username = username.trim();
    if(checkString.contentLength(username) > 30) throw '用户名不能超过30个字节';
    if(username === '') throw '用户名不能为空';
    password = password.trim();
    if(password === '') throw '密码不能为空';
    if(!checkString.checkPass(password)) throw '密码要具有数字、字母和符号三者中的至少两者';
    if(checkString.contentLength(password) < 8) throw '密码长度不能小于8位';
    databaseName = databaseName.trim();
    if(!databaseName) throw '数据库名不能为空';
    const reg = /^[0-9a-zA-Z_]+$/;
    if(!reg.test(databaseName)) throw '数据库名仅限字母、数字、下划线';
    if(!fs.existsSync(path.resolve(__dirname, '../settings/mongoDB.js'))) {
      fs.writeFileSync(path.resolve(__dirname, '../settings/mongoDB.js'), `module.exports = 'mongodb://localhost/${databaseName}';`);
    }

    console.log('正在安装依赖模块...');
    execSync('cd ../ && npm install');
    console.log('依赖模块安装完成');

    console.log(`正在创建管理员账号...`);
    const {UsersPersonalModel, UserModel} = require('../dataModels');
    const user = await UserModel.createUser({});
    await user.update({certs: ['dev'], username, usernameLowerCase: username.toLowerCase()});
    const apiFunction = require('../nkcModules/apiFunction');
    const newPassword = apiFunction.newPasswordObject(password);
    await UsersPersonalModel.update({uid: user.uid}, {$set: {password: newPassword.password, hashType: newPassword.hashType}});
    console.log(`管理员账号创建成功`);
  } catch(err) {
    console.log(err)
  }
})();

















/*
const http = require('http');
const fs = require('fs');
const queryString = require('querystring');
const checkString = require('../tools/checkString');
const { execSync } = require('child_process');
let installing = false;
let error = '';
async function createServer() {
  http.createServer((req, res) => {
    let {url, method} = req;
    if(url.includes('jquery')) {
      return res.end(fs.readFileSync('./jquery-1.11.1.js'));
    } else if(url === '/status'){
      if(error) {
        return res.end('error');
      } else if(installing) {
        return res.end('installing');
      } else {
        return res.end('');
      }
    } else if(url === '/') {
      method = method.toLowerCase();
      if(method === 'get') {
        return res.end(fs.readFileSync('./index.html'));
      } else if(method === 'post') {
        let data = '';
        req.on('data', (d) => {
          data += d;
        });
        req.on('end', async () => {
          try{
            const user = queryString.parse(data);
            user.username = user.username.trim();
            if(checkString.contentLength(user.username) > 30) throw '用户名不能超过30个字节';
            if(user.username === '') throw '用户名不能为空';
            user.password = user.password.trim();
            if(user.password === '') throw '用户名不能为空';
            if(!checkString.checkPass(user.password)) throw '密码要具有数字、字母和符号三者中的至少两者';
            if(checkString.contentLength(user.password) < 8) throw '密码长度不能小于8位';
            user.databaseName = user.databaseName.trim();
            if(!user.databaseName) throw '数据库名不能为空';
            const reg = /^[0-9a-zA-Z_]+$/;
            if(!reg.test(user.databaseName)) throw '数据库名仅限字母、数字、下划线';
            install(user);
            return res.end();
          } catch(err) {
            res.writeHead(500);
            res.end(err.message || err);
          }
        });
        req.on('error', (err) => {
          res.writeHead(500);
          res.end(err.message);
        })
      }
    } else {
      res.end();
    }
  }).listen(9000);
}

async function install(user) {

  const aa = execSync('cmd.exe cd ../; npm install');
  console.log(aa.toString());

}


(async () => {
  try{
    createServer();
  } catch(err) {
    console.error(err);
  }
})();*/
