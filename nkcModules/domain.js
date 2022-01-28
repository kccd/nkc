const ipHostReg = /^([0-9]{1,3}\.?){4}(:[0-9]{0,5})?$/;

function isIpDomain(host) {
  return ipHostReg.test(host);
}

function getRootDomainByHost(host) {
  if(isIpDomain(host)) return '';
  host = host.replace(/:.*/ig, '');
  host = host.split('.').reverse();
  return `${host[1]}.${host[0]}`;
}

module.exports = {
  getRootDomainByHost,
  isIpDomain,
}