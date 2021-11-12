const CommunicationClient = require('../../tools/communicationClient');
const communicationConfig = require('../../config/communication');
const {address, port} = global.Media;

const communicationClient = new CommunicationClient({
  serviceName: communicationConfig.servicesName.media,
  serviceId: global.Media.processId,
  servicePort: port,
  serviceAddress: address
});

function getCommunicationClient() {
  return communicationClient;
}

function sendResourceStatusToNKC(props) {
  const {rid, status, error, filesInfo} = props;
  const communicationClient = getCommunicationClient();
  communicationClient.sendMessage(communicationConfig.servicesName.nkc, {
    type: 'resourceStatus',
    data: {
      rid,
      status,
      error,
      filesInfo
    }
  });
}

module.exports = {
  getCommunicationClient,
  sendResourceStatusToNKC
};
