const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let threadTypesSchema = new Schema({
  threadTypeId: {
    type: Number,
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

let findMaxNumber = async (fid) => {
  let threadType = await ThreadTypes.findOne({fid: fid}).sort({order: -1});
  if(!threadType || (!threadType.order && threadType.order !== 0)) return -1;
  return threadType.order;
};

threadTypesSchema.pre('save',async function(next){
  if(!this.order && this.order !== 0) {
    let number = await findMaxNumber(this.fid);
    this.order = number + 1;
  }
  await next();
});
module.exports = mongoose.model('threadTypes', threadTypesSchema, 'threadTypes');