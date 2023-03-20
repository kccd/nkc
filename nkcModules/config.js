const serverConfig = require('../config/server.json');
const { program } = require('commander');

program
  .option(
    '-p, --port <number>',
    `Server port(default ${serverConfig.port})`,
    serverConfig.port,
  )
  .option(
    '--host <char>',
    `Server host(default ${serverConfig.address})`,
    serverConfig.address,
  );

program.parse();

const options = program.opts();

module.exports = {
  host: options.host,
  port: Number(options.port),
};
