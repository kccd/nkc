const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let threadTypesSchema = new Schema({
  cid: {
    type: Number,
    unique: true,
    required: true
  },
  order: {
    type: Number,
  },
  fid: {
    type: String,
    required: true,
    index: 1
  },
  name: {
    type: String,
    required: true
  }
});

threadTypesSchema.pre('save',async function(next){
  if(!this.order && this.order !== 0) {
    const ThreadTypeModel = require('./ThreadTypeModel');
    const threadType = await ThreadTypeModel.findOne({fid: this.fid}).sort({order: -1});
    if(!threadType || (!threadType.order && threadType.order !== 0)) {
      this.order = 1;
    } else {
      this.order = threadType.order + 1;
    }
  }
  await next();
});

module.exports = mongoose.model('threadTypes', threadTypesSchema, 'threadTypes');