require("colors");
const dbStatus = require('./settings/dbStatus');
const socket = require('./socket/index');

dbStatus.database()
  .then(() => {
    return socket();
  })
  .catch(err => {
    console.log(`SOCKET ERROR`.red);
    console.log((err.stack || err.message || err).red);
    process.exit(1);
  });
