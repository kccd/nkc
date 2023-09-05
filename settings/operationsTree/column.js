const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.column_apply,
  POST: Operations.column_apply,
  apply: {
    GET: Operations.column_apply,
  },
  getColumn: {
    GET: Operations.getColumnInfo,
  },
  editor: {
    GET: Operations.columnEditor,
  },
};
