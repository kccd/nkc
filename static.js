const KOA = require('koa');
const http = require('http');
const serverConfig = require('./config/server.json');
const {port, host} = serverConfig.staticServer;

const staticServe = path => {
  return require('koa-static')(path, {
    setHeaders: function(response) {
      response.setHeader('Cache-Control', `public, max-age=604800`)
    }
  });
};

const app = new KOA();
app
  .use(staticServe('./dist/pages'))
  .use(staticServe('./node_modules'))
  .use(staticServe('./nkcModules'))
  .use(staticServe('./public'))

const staticServer = http.createServer(app.callback());

staticServer.listen(port, host, () => {
  console.log(`Static file server is running at ${host}:${port}`);
});
