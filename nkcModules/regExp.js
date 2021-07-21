const {domain, domainWhitelist} = require('../config/server.json');

const domainReg = new RegExp(`^` +
  domain
    .replace(/\//g, "\\/")
    .replace(/\./g, "\\.")
  + "|^\/"
  , "i");

const regString = [];
for(let d of domainWhitelist) {
  d = d.replace(/\./g, '\\.');
  regString.push(d);
}

const domainWhitelistReg = new RegExp(`^(https?:\/\/)?(${regString.join('|')})`, 'i');

module.exports = {
  domainReg,
  domainWhitelistReg
};
