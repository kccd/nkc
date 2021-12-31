const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const problemsTypeSchema = new Schema({
  _id: Number,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  order: {
    type: Number,
    default: 1,
    index: 1
  },
  name: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
}, {
  collection: 'problemsTypes'
});
problemsTypeSchema.methods.updateProblemsCount = async function() {
  const ProblemModel = mongoose.model('problems');
  this.count = await ProblemModel.countDocuments({typeId: this._id});
  await this.save();
};
const ProblemsTypeModel = mongoose.model('problemsTypes', problemsTypeSchema);

module.exports = ProblemsTypeModel;