const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitToolsList,
  open: {
    PARAMETER: {
      GET: Operations.visitTool,
    },
  },
  upload: {
    POST: Operations.uploadTool,
  },
  update: {
    POST: Operations.updateTool,
  },
  delete: {
    DELETE: Operations.deleteTool,
  },
  hide: {
    DELETE: Operations.hideTool,
  },
  enableSiteTools: {
    POST: Operations.enableSiteTools,
  },
};
