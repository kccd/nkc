const MomentModel = require('../../dataModels/MomentModel');

class MomentListService {
  async getExtendMomentsList(uid, momentIds) {
    const moments = await MomentModel.find({
      _id: {
        $in: momentIds,
      },
    }).sort({ top: -1 });
    return await MomentModel.extendMomentsListData(moments, uid);
  }
}

module.exports = {
  momentListService: new MomentListService(),
};
