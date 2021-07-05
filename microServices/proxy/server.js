require('colors');
require('../../global');
const moment = require('moment');
const https = require('https');
const http = require('http');
const {ports} = require('../../config/proxy');
const {httpProxyServer, httpsProxyServer, html, secureContext} = require('./proxyData');
const {getProxyServer, getCert} = require('./methods');


const httpServer = http.createServer((req, res) => {
  const {url, headers} = req;
  const {host} = headers;
  const httpPS = httpProxyServer[host];
  const httpsPS = httpsProxyServer[host];
  // http server
  if(httpPS) {
    const {type, target, servers, socketServers, httpBalanceType, socketBalanceType} = httpPS;
    if(type === 'proxy') {
      // 代理
      const _server = getProxyServer(req, res, servers, socketServers, httpBalanceType, socketBalanceType);
      return _server.web(req, res);
    } else if(type === 'redirect') {
      // 重定向
      res.writeHead(301, {
        'location': target[0] + url
      });
      return res.end();
    }
  } else if(httpsPS) {
    // 如果不存在http但存在https，则重定向到https
    res.writeHead(301, {
      'location': `https://${host}${url}`
    });
    return res.end();
  }
  res.writeHead(404);
  res.end(html['404']);
});

const defaultCert = getCert('default');

const httpsOptions = {
  SNICallback: function(domain, cb) {
    const sc = secureContext[domain] || secureContext['default'];
    if(cb) {
      cb(null, sc);
    } else {
      return sc;
    }
  },
  cert: defaultCert.cert,
  key: defaultCert.key,
  minVersion: 'TLSv1.1'
};

const httpsServer = https.createServer(httpsOptions, (req, res) => {
  const {url, headers} = req;
  const {host} = headers;

  const httpPS = httpProxyServer[host];
  const httpsPS = httpsProxyServer[host];

  if(httpsPS) {
    const {type, target, servers, socketServers, httpBalanceType, socketBalanceType} = httpsPS;
    if(type === 'proxy') {
      const _server = getProxyServer(req, res, servers, socketServers, httpBalanceType, socketBalanceType);
      return _server.web(req, res);
    } else if(type === 'redirect') {
      // 重定向
      res.writeHead(301, {
        'location': target[0] + url
      });
      return res.end();
    }
  } else if(httpPS) {
    res.writeHead(301, {
      'location': `http://${host}${url}`
    });
    return res.end();
  }
  res.writeHead(404);
  res.end(html['404']);
});


// websocket握手请求
httpServer.on('upgrade', upgrade);
httpsServer.on('upgrade', upgrade);

function upgrade(req, socket, head) {
  const {host} = req.headers;
  const PS = httpsProxyServer[host] || httpProxyServer[host];
  if(PS && PS.type === 'proxy') {
    const server = getProxyServer(req, null, PS.servers, PS.socketServers, PS.httpBalanceType, PS.socketBalanceType);
    server.ws(req, socket, head);
  }
  socket.setKeepAlive(false, 0);
  socket.on('error', (err) => {
    console.log(`${`UPGRADE ERROR `.bgRed} ${moment().format('YYYY-MM-DD HH:mm:ss')} ${(' ' + host + ' ').bgGreen} ${err.message.bgRed}`);
  });
}

httpServer.on('error', (err) => {
  console.log(`proxy http error`);
  console.log(err);
});
httpsServer.on('error', (err) => {
  console.log(`proxy https error`);
  console.log(err);
});

httpServer.listen(ports.httpPort, () => {
  console.log(`PROXY: http server is running at ${ports.httpPort}.`);
});

httpsServer.listen(ports.httpsPort, () => {
  console.log(`PROXY: https server is running at ${ports.httpsPort}.`);
  if(process.connected) process.send('ready');
});

process.on('message', function(msg) {
  if (msg === 'shutdown') {
    httpServer.close();
    httpsServer.close();
    console.log(`proxy service ${global.NKC.processId} stopped`.green);
    process.exit(0);
  }
});

