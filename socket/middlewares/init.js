const db = require("../../dataModels");
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

  let ip = socket.handshake.address;
  let address = '';
  if(serverConfigs.proxy) {
    let xForwardedFor = socket.handshake.headers['x-forwarded-for'];
    xForwardedFor =	xForwardedFor.split(',');
    xForwardedFor.push(ip);
    xForwardedFor.reverse();
    const _ip = xForwardedFor[serverConfigs.maxIpsCount - 1];
    address = _ip || ip;
  }
  address = address.replace(/::ffff:/ig, '');
  socket.NKC.address = address;
  socket.NKC.query = socket.handshake.query;
  await next();
};
module.exports = func;
