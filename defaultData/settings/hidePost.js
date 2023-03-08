const {settingIds} = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.hidePost,
  c: {
    postHeight: {
      xs: 300,
      sm: 250,
      md: 200,
      float: 0.5
    },
    rolesId: [],
    defaultRoleGradesId: [],
    voteUpCount: 10,
    hideDigestPost: false,
    allowedAuthor: false,
    allowedRolesId: []
  }
};
