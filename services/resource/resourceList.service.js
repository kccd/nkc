const ResourceModel = require('../../dataModels/ResourceModel');

class ResourceListService {
  async getResourcesObjectByResourcesId(resourcesId) {
    const resources = await ResourceModel.find({ rid: { $in: resourcesId } });
    const obj = {};
    for (const resource of resources) {
      obj[resource.rid] = resource;
    }
    return obj;
  }
}

module.exports = {
  resourceListService: new ResourceListService(),
};
