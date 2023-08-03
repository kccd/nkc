const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitEditor,
  // copy:{
  // 	GET: Operations.visitEditor
  // },
  data: {
    GET: Operations.visitEditor,
  },
  publishNotice: {
    GET: Operations.visitEditor,
  },
};
