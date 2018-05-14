const http = require('http');
const https = require('https');
const app = require('./app');
const searchInit = require('./searchInit');
const settings = require('./settings');
const {useHttps, updateDate} = settings;
const serverSettings = settings.server;
const listenAddr = '0.0.0.0';

let server;
let redirectServer;

searchInit()
  .then(() => {
    console.log('ElasticSearch is ready...'.green);
    const jobs = require('./scheduleJob');
    jobs.updateActiveUsers(updateDate.updateActiveUsersCronStr);
    jobs.updateForums(updateDate.updateForumsCronStr);
    if(useHttps) {
      const httpsOptions = settings.httpsOptions();
      server = https.Server(httpsOptions, app)
        .listen(
          serverSettings.httpsPort,
          listenAddr,
          () => console.log(`${serverSettings.name} listening on ${listenAddr}:${serverSettings.httpsPort}`.green)
        );

      redirectServer = http.createServer((req, res) => {
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
  })
  .catch(e => {
    console.error(`error occured when initialize the ElasticSearch.\n${e.stack}`.red)
    process.exit(-1)
  });


