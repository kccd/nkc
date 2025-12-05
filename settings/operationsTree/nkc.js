const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.nkcManagement,
  POST: Operations.nkcManagement,
  home: {
    GET: Operations.nkcManagementHome,
    POST: Operations.nkcManagementHome,
    PUT: Operations.nkcManagementHome,
    showActivityEnter: {
      PUT: Operations.showActivityEnter,
    },
    block: {
      POST: Operations.nkcManagementHome,
      PUT: Operations.nkcManagementHome,
      PARAMETER: {
        GET: Operations.nkcManagementHome,
        PUT: Operations.nkcManagementHome,
        DELETE: Operations.nkcManagementHome,
        disabled: {
          PUT: Operations.nkcManagementHome,
        },
        refresh: {
          POST: Operations.nkcManagementHome,
        },
      },
    },
  },
  sticker: {
    GET: Operations.nkcManagementSticker,
    POST: Operations.nkcManagementSticker,
  },
  note: {
    GET: Operations.nkcManagementNote,
    POST: Operations.nkcManagementNote,
  },
  post: {
    GET: Operations.nkcManagementPost,
    POST: Operations.nkcManagementPost,
    drafts: {
      GET: Operations.nkcManagementPost,
    },
  },
  document: {
    GET: Operations.nkcManagementDocument,
    POST: Operations.nkcManagementDocument,
  },
  column: {
    GET: Operations.nkcManagementColumn,
    POST: Operations.nkcManagementColumn,
  },
  section: {
    GET: Operations.nkcManagementSection,
    POST: Operations.nkcManagementSection,
  },
  applyForum: {
    GET: Operations.nkcManagementApplyForum,
    POST: Operations.nkcManagementApplyForum,
  },
  securityApplication: {
    GET: Operations.nkcManagementSecurityApplication,
    POST: Operations.nkcManagementSecurityApplication,
  },
  os: {
    GET: Operations.nkcManagementOS,
  },
  secretWatermark: {
    GET: Operations.nkcManagementSecretWatermark,
  },
};
