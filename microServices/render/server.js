require('colors');
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
communicationClient.onMessage(async message => {
  const {from, content} = message;
  const {templatePath, state, data} = content;
  return await renderPug(templatePath, state, data);
});

console.log(`render service is running at ${servicePort}`.green);