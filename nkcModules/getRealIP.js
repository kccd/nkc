const {proxy, maxIpsCount} = require('../config/server.json');
module.exports = (props) => {
  let {
    remoteIp: ip,
    remotePort: port,
    xForwardedFor,
    xForwardedRemotePort
  } = props;

  if(proxy) {
    if(xForwardedFor) {
      xForwardedFor =	xForwardedFor.split(',');
    } else {
      xForwardedFor = [];
    }
    xForwardedFor.push(ip);
    xForwardedFor.reverse();
    const _ip = xForwardedFor[maxIpsCount - 1];
    ip = _ip || ip;
    if(xForwardedRemotePort) {
      xForwardedRemotePort = xForwardedRemotePort.split(',');
    } else {
      xForwardedRemotePort = [];
    }
    xForwardedRemotePort.push(port);
    xForwardedRemotePort = xForwardedRemotePort.map(p => Number(p));
    xForwardedRemotePort.reverse();
    const _port = xForwardedRemotePort[maxIpsCount - 1];
    port = _port || port;
  }
  return {
    ip: ip.replace(/^::ffff:/, ''),
    port
  };
};