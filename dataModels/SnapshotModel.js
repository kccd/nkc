const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const SnapshotSchema = new Schema({
  tableName: {
    type: String,
    required: true
  },
	snapshot: {
    type: Object,
    default: {}
  },
  createTime: {
    type: Date,
    default: Date.now,
  }
},
{
  collection: "snapshot"
}
);

SnapshotSchema.statics.snapshotForum = async function(fid) {
  let ForumModel = mongoose.model("forums");
  let Snapshot = mongoose.model('snapshot');
  let forum = await ForumModel.findOne({ fid });
  if(!forum) return;
  await Snapshot({
    tableName: "forums",
    snapshot: forum.toObject()
  }).save();

}

module.exports = mongoose.model('snapshot', SnapshotSchema);
