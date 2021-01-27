require("colors");
const socket = require('./socket/index');
socket()
  .catch(err => {
    console.log(`SOCKET ERROR`.red);
    console.log((err.stack || err.message || err).red);
  });
