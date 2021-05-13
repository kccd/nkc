const esConfig = require("../config/elasticSearch");
const ES = require("elasticsearch");

const {address, port} = esConfig;

module.exports = () => {
  return new ES.Client({
    node: address + ":" + port,
    requestTimeout: 90000
  });
}