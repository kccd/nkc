const {Thread} = require('node-threads-pool');
const methods = require('./methods');

new Thread(async ({type, data}) => {
  return methods[type](data);
});
