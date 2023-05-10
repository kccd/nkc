const { settingIds } = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.library,
  c: {
    authLevelMin: 1,
    exam: {
      volumeA: true,
      volumeB: true,
      notPass: {
        status: false,
        countLimit: 5,
        unlimited: true,
      },
    },
    permission: {
      roles: [],
      /* {
        roleId: String,
        operations: ["createFolder", ...]
      } */
      grades: [],
    },
    libraryTip: {
      tipShow: '',
      tipUpload: '',
    },
  },
};
