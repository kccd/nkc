const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const MomentModel = require('../../dataModels/MomentModel');
class EditorMomentService {
  async checkeditOtherUserMomentPermission(uid, mid, permission) {
    const { normal: momentNormal } = await MomentModel.getMomentStatus();
    const moment = await MomentModel.findOne(
      { _id: mid },
      { uid: 1, did: 1, status: 1 },
    );
    //判断是否是作者或者是有相关权限的管理员
    if (uid !== moment.uid && !permission('editOtherUserMoment')) {
      ThrowBadRequestResponseTypeError(ResponseTypes.FORBIDDEN);
    } else if (moment.status !== momentNormal) {
      ThrowBadRequestResponseTypeError(ResponseTypes.MOMENT_CAN_NOT_BE_EDITED);
    }
  }
}
module.exports = {
  EditorMomentService: new EditorMomentService(),
};
