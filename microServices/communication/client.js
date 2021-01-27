require('colors');
const SocketIO = require('socket.io-client');
const communicationConfig = require('../serviceConfigs/communication');

class CommunicationClient {
  constructor(props) {
    const {serviceName, serviceId} = props;
    const serviceTag = `communication client ${serviceName}:${serviceId}`;
    const options = Object.assign(
      {},
      communicationConfig.socketClientOptions,
      {
        auth: {
          serviceName,
          serviceId
        }
      }
    );
    this.socket = SocketIO(`http://${communicationConfig.serverHost}:${communicationConfig.serverPort}`, options);
    const eventsName = [
      'connect',
      'error',
      'reconnect',
      'reconnect_error',
      'reconnecting',
      'connect_failed',
      'connect_timeout',
      'connecting',
      'reconnect_failed',
      'disconnect',
    ];
    for(const eventName of eventsName) {
      this.socket.on(eventName, (err) => {
        console.log(`${serviceTag} ${eventName}`.blue);
        if(err) console.log(err.red);
      });
    }
  }
  connect() {
    const {socket} = this;
    return new Promise((resolve, reject) => {
      if(socket.connected) return resolve();
      setTimeout(() => {
        const error = new Error('communication client connect timeout');
        error.status = 500;
        reject(error);
      }, 1000);
      socket.on('connect', () => {
        resolve();
      });
      socket.connect();
    });
  }
  async sendMessagePromise(targetServiceName, content) {
    const {socket} = this;
    await this.connect();
    return new Promise((resolve, reject) => {
      if(socket.disconnected) {
        const error = new Error('socket is disconnected');
        error.status = 500;
        return reject(error);
      }
      socket.emit(communicationConfig.messageEventName, {
        to: targetServiceName,
        content
      }, res => {
        const {status, content = {}} = res;
        if(status === 200) {
          resolve(content)
        } else {
          const error = new Error(content.message);
          error.status = status;
          reject(error);
        }
      });
    });
  }
  sendMessage(targetServiceName, content) {
    this.sendMessagePromise(targetServiceName, content)
      .catch(console.error);
  }
  onMessage(callback) {
    this.socket.on(communicationConfig.messageEventName, async (data, _callback) => {
      Promise.resolve()
        .then(() => {
          return callback(data);
        })
        .then(res => {
          if(res) {
            _callback(res);
          } else {
            _callback({
              status: 200,
              content: {}
            });
          }
        })
    });
  }
}

module.exports = CommunicationClient;
