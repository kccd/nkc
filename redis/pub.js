require('colors');

const Redis = require('redis');

const pub = Redis.createClient();


pub.on('error', (err) => {

  console.log(`连接redis出错: `);
  console.log(err);

});


const obj = {};

obj.pubConnect = async (uid) => {
  pub.publish(`connect`, JSON.stringify({
    uid
  }));
};

obj.pubDisconnect = async (uid) => {
  pub.publish(`disconnect`, JSON.stringify({
    uid
  }));
};

obj.pubMessage = async (message) => {
  pub.publish('message', JSON.stringify(message));

};

obj.pubWithdrawn = async (message) => {

  pub.publish('withdrawn', JSON.stringify(message));
};

module.exports = obj;