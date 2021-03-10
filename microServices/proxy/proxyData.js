const httpProxy = require('http-proxy-ws');
const PATH = require('path');
const http = require('http');
const tls = require('tls');
const moment = require('moment');
const fs = require('fs');
const {servers, httpAgent, timeout} = require('../../config/proxy');
const httpsProxyServer = {};
const httpProxyServer = {};
const {getCert} = require('./methods');

const defaultCert = getCert('default');

let html = {};

const files = fs.readdirSync(PATH.resolve(__dirname, './html'));
for(const fileName of files) {
  const name = fileName.replace(/\..*/ig, '');
  html[name] = fs.readFileSync(PATH.resolve(__dirname, `./html/${fileName}`));
}

const secureContext = {
  'default': tls.createSecureContext({
    key: defaultCert.key,
    cert: defaultCert.cert
  })
};

const agent = new http.Agent(httpAgent);

for(const s of servers) {
  const {name, type, domains, https, target = [], disabled, socketTarget = [], socketBalanceType, httpBalanceType} = s;
  if(disabled) continue;
  if(!domains.length || !target.length) throw 'domains, target不能为空';
  let _proxyServer;
  if(https) {
    _proxyServer = httpsProxyServer;
  } else {
    _proxyServer = httpProxyServer;
  }

  const proxyServers = [], socketServers = [];

  const arr = [];
  for(const t of target) {
    arr.push({
      type: 'http',
      target: t
    });
  }
  for(const t of socketTarget) {
    arr.push({
      type: 'socket',
      target: t
    });
  }

  for(const t of arr) {
    const {type, target} = t;
    const server = httpProxy.createProxyServer({
      agent: agent,
      ws: true,
      xfwd: true,
      target: target,
      timeout: timeout,
    });
    server.on('error', (err, req, res) => {
      const {host} = req.headers;
      console.log(`${` ERROR `.bgRed} ${moment().format('YYYY-MM-DD HH:mm:ss')} ${(' ' + host + ' ').bgGreen} ${err.message.bgRed}`);
      try{
        res.writeHead(503);
        res.end(html['503']);
      } catch(err) {
        console.log(`${` ERROR `.bgRed} ${moment().format('YYYY-MM-DD HH:mm:ss')} ${(' ' + host + ' ').bgGreen} ${err.message.bgRed}`);
      }
    });
    server.on('proxyReq', (proxyReq, req, res) => {
      try{
        proxyReq.setHeader('X-forwarded-Remote-Port', req.connection.remotePort);
      } catch(err) {
        const {host} = req.headers;
        console.log(`${` ERROR `.bgRed} ${moment().format('YYYY-MM-DD HH:mm:ss')} ${(' ' + host + ' ').bgGreen} ${err.message.bgRed}`);
      }
    });
    if(type === 'http') {
      proxyServers.push(server);
    } else {
      socketServers.push(server);
    }

  }

  for(const domain of domains) {
    _proxyServer[domain] = {
      name,
      type,
      target,
      servers: proxyServers,
      socketServers: socketServers,
      socketBalanceType,
      httpBalanceType,
    }
    if(https) {
      const cert = getCert(domain);
      secureContext[domain] = tls.createSecureContext({
        key: cert.key,
        cert: cert.cert,
      });
    }
  }
}

module.exports = {
  html,
  httpsProxyServer,
  httpProxyServer,
  secureContext,
  defaultCert
}
