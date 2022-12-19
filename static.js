const {program} = require('commander');
const path = require('path');
const KOA = require('koa');
const http = require('http');

program
  .option('-p, --port <number>', 'Server port(default 1086)', '1086')
  .option('--host <char>', 'Server host(default 0.0.0.0)', '0.0.0.0')
  .option('-a, --age <char>', 'max age(default 2592000)', '2592000')
  .option('-d, --dir [dirs...]', 'target directory(default ./)', './')

program.parse();

const options = program.opts();

const staticServe = path => {
  return require('koa-static')(path, {
    setHeaders: function(response) {
      response.setHeader('Cache-Control', `public, max-age=${options.age}`)
    }
  });
};

const app = new KOA();
for(const dir of options.dir) {
  app.use(staticServe(path.resolve(dir)));
}

const staticServer = http.createServer(app.callback());

staticServer.listen(options.port, options.host, () => {
  console.log(`Static service is running at ${options.host}:${options.port}`);
});
