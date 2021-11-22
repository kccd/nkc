const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const originImageSchema = new Schema({
  originId: {
    type: String,
    index: 1,
    default: ""
  },
  ext: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    default: ''
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tpath: {
    type: String,
    default: ''
  },
  uid: {
    type: String,
    required: true,
    index: 1
  }
});

originImageSchema.methods.getRemoteFile = async function() {
  const FILE = require('../nkcModules/file');
  const ResourceModel = mongoose.model('resources');
  const {originId, ext, toc} = this;
  const resource = await ResourceModel.findOne({originId});
  let name = `${originId}.${ext}`;
  if(resource) {
    name = resource.oname;
  }
  return await FILE.getRemoteFile({
    id: originId,
    toc,
    ext,
    type: 'mediaOrigin',
    name
  });
};

module.exports = mongoose.model('originImage', originImageSchema);
