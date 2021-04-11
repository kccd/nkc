const db = require("../../dataModels");
const nkcModules = require('../../nkcModules');
const settings = require("../../settings");
const serverConfigs = require('../../config/server.json');
const tools = require("../../tools");
const util = require('../util');
const func = async (socket, next) => {
  socket.NKC = {
    db,
    settings,
    tools,
    util,
    data: {},
    query: {},
  };

  const {ip} = nkcModules.getRealIP({
    remoteIp: socket.handshake.address,
    xForwardedFor: socket.handshake.headers['x-forwarded-for'],
  });
  socket.NKC.address = ip;
  socket.NKC.query = socket.handshake.query;
  await next();
};
module.exports = func;
