const {renderPug} = require('./services');
const Communication = require('../../tools/communicationClient');
const communicationConfig = require('../../config/communication.json');
const {port: servicePort, address: serviceAddress} = require('../../config/render.json');
const communicationClient = new Communication({
  servicePort,
  serviceAddress,
  serviceId: process.pid,
  serviceName: communicationConfig.servicesName.render,
});
communicationClient.onMessage(message => {
  const {from, content} = message;
  console.log(`来自 ${from} 的渲染任务`);
  const {pugFilePath, state, data} = content;
  return renderPug(pugFilePath, state, data);
});