const ResourceModel = require("../../../dataModels/ResourceModel");
module.exports = {
  params: {
    rid: 'string',
    status: 'string',
    error:'string',
    filesInfo: 'array'
  },
  handler(ctx) {
    const {rid, status, error, filesInfo} = ctx.params;
    return ResourceModel.updateResourceStatus({
      rid,
      status,
      error,
      filesInfo
    });
  }
}
