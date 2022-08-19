const VerifiedUploadModel = require("../../../dataModels/VerifiedUploadModel");
module.exports = {
  params: {
    vid: 'string',
    status: 'boolean',
    error:'string',
    filesInfo: 'object'
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
