const MomentModel = require('../../dataModels/MomentModel');
class MomentContentService {
  async renderContent(content) {
    return await MomentModel.renderContent(content);
  }
}

module.exports = {
  momentContentService: new MomentContentService(),
};
