const ForumModel = require('../../dataModels/ForumModel');
class ForumPermissionService {
  async visitorHasReadPermission(forumsId) {
    try {
      await ForumModel.checkReadPermission(null, forumsId);
      return true;
    } catch (err) {
      return false;
    }
  }
}
module.exports = {
  forumPermissionService: new ForumPermissionService(),
};
