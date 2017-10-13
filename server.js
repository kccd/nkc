const http = require('http');
const https = require('https');

const app = require('./app');
const settings = require('./settings');
const useHttps = settings.useHttps;
const serverSettings = settings.server;
const listenAddr = '0.0.0.0';
const nkcModules = require('./nkcModules');
const logger = nkcModules.logger;

let server;
let redirectServer;

if(useHttps) {
  const httpsOptions = settings.httpsOptions();
  server = https.Server(httpsOptions, app)
    .listen(
      serverSettings.httpsPort,
      listenAddr,
      () => console.log(`${serverSettings.name} listening on ${listenAddr}:${serverSettings.httpsPort}`.green)
    );

  redirectServer = http.createServer((req, res) => {``
    const host = req.headers['host'];
    res.writeHead(301, {
      'Location': 'https://' + host + req.url
    });
    res.end();
  })
    .listen(serverSettings.port, listenAddr);
} else {
  server = http.createServer(app).listen(
    serverSettings.port,
    listenAddr,
    () => console.log(`${serverSettings.name} listening on ${listenAddr}:${serverSettings.port}`.green)
  );
}
