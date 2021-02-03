const func = {};
const PATH = require('path');
const {httpsDomains, httpDomains} = require('./proxyData');
const fs = require('fs');
const farmHash = require('farmhash');

func.getSocketServerId = (req, res, count, balanceType = 'random') => {
  if(count === 1) return 0;
  if(balanceType === 'ipHash') {
    const ip = func.getClientIp(req);
    return farmHash.hash32(ip) % count;
  } else {
    return Math.round(Math.random() * 10000) % count
  }
};

const reg = /^\/socket\.io\/\?/i;
const obj = {};
func.getProxyServer = (req, res, servers, socketServers, httpBalanceType, socketBalanceType) => {
  let serversArr;
  let balanceType;
  if(reg.test(req.url) && socketServers.length) {
    serversArr = socketServers;
    balanceType = socketBalanceType;
  } else {
    serversArr = servers;
    balanceType = httpBalanceType;
  }
  const num = func.getSocketServerId(req, res, serversArr.length, balanceType);
  if(obj[num] === undefined) obj[num] = 0;
  obj[num] ++;
  console.log(JSON.stringify(obj, '', 2));
  return serversArr[num];
};
func.getClientIp = (req) => {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
};

func.isHttp = function(domain) {
  return httpDomains.includes(domain);
}
func.isHttps = function(domain) {
  return httpsDomains.includes(domain);
}

func.getCert = (domain) => {
  let keyPath = PATH.resolve(__dirname, `./cert/${domain}.key`);
  let certPath = PATH.resolve(__dirname, `./cert/${domain}.crt`);
  if(!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log(`未找到 ${domain} 相关证书，已读取默认证书`)
    keyPath = PATH.resolve(__dirname, `./cert/default.key`);
    certPath = PATH.resolve(__dirname, `./cert/default.crt`);
  }
  return {
    key: fs.readFileSync(keyPath, 'utf-8'),
    cert: fs.readFileSync(certPath, 'utf-8')
  }
}
module.exports = func;
