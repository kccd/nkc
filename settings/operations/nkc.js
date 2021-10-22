module.exports = {
  GET: "nkcManagement",
  POST: "nkcManagement",
  home: {
    GET: "nkcManagementHome",
    POST: "nkcManagementHome",
    PUT: "nkcManagementHome",
    showActivityEnter: {
      PUT: "showActivityEnter"
    },
    block: {
      POST: 'nkcManagementHome',
      PUT: 'nkcManagementHome',
      PARAMETER: {
        PUT: 'nkcManagementHome',
        DELETE: 'nkcManagementHome',
        disabled: {
          PUT: 'nkcManagementHome',
        }
      }
    }
  },
  sticker: {
    GET: "nkcManagementSticker",
    POST: "nkcManagementSticker"
  },
  note: {
    GET: "nkcManagementNote",
    POST: "nkcManagementNote"
  },
  post: {
    GET: "nkcManagementPost",
    POST: "nkcManagementPost"
  },
  column: {
    GET: "nkcManagementColumn",
    POST: 'nkcManagementColumn',
  },
  section: {
    GET: "nkcManagementSection",
    POST: "nkcManagementSection"
  },
  applyForum: {
    GET: 'nkcManagementApplyForum',
    POST: "nkcManagementApplyForum"
  },
  securityApplication: {
    GET: 'nkcManagementSecurityApplication',
    POST: 'nkcManagementSecurityApplication'
  }
};
