const db = require("../../dataModels");
const getRealIP = require('../../nkcModules/getRealIP');
const settings = require("../../settings");
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

  const {ip} = getRealIP({
    remoteIp: socket.handshake.address,
    xForwardedFor: socket.handshake.headers['x-forwarded-for'],
  });
  socket.NKC.address = ip;
  socket.NKC.query = socket.handshake.query;
  await next();
};
module.exports = func;
