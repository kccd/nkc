const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const answerSheetsSchema = new Schema({
	key: {
    type: String,
    unique: true,
    required: true
  },
  uid: {
    type: String,
    default: '',
    index: 1
  },
  score: {
    type: Number,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: true
  },
  tsm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  ip: {
    type: String,
    default: '0.0.0.0',
    index: 1,
  },
  isA: {
    type: Boolean,
    default: false,
    index: 1
  },
  records: {
    type: [Schema.Types.Mixed],
    required: true
  },
  category: {
    type: String,
    default: ''
  }
}, {
	collection: 'answerSheets'
});

answerSheetsSchema.statics.ensureAnswerSheet = async (key) => {
	const AnswerSheetModel = mongoose.model('answerSheets');
	const answerSheet = await AnswerSheetModel.findOne({key});
	if(!answerSheet) {
		const err = new Error('注册码无效。');
		err.status = 400;
		throw err;
	}
	if(answerSheet.uid) {
		const err = new Error('注册码已被使用。');
		err.status = 400;
		throw err;
	}
	const {timeBeforeRegister} = require('../settings/exam');
	if(answerSheet.toc < (Date.now() - timeBeforeRegister)) {
		const err = new Error('注册码已过期。');
		err.status = 400;
		throw err;
	}
	return answerSheet;
};

answerSheetsSchema.pre('save', function(next) {
  try {
    let num = 0;
    for (let answer of this.records) {
      if (answer.correct) {
        num++;
      }
    }
    this.score = num;
    return next()
  } catch(e) {
    return next(e)
  }
});
module.exports = mongoose.model('answerSheets', answerSheetsSchema, 'answerSheets');