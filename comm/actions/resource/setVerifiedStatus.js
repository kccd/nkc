const VerifiedUploadModel = require("../../../dataModels/VerifiedUploadModel");
module.exports = {
  params: {
    vid: 'string',
    status: 'string',
    error:'string',
    filesInfo: 'array'
  },
  handler(ctx) {
    const {vid, status, error, filesInfo} = ctx.params;
    return VerifiedUploadModel.updateVerifiedState({
      vid,
      status,
      error,
      filesInfo
    });
  }
}
