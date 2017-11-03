let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.15');
db.useDatabase('rescue');

let answersheetsSchema = new Schema({
  key: {
    type: String,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
  },
  toc: {
    type: Number,
    default: Date.now,
  },
  tsm: {
    type: Number,
    default: Date.now,
  },
  ip: {
    type: String,
    default: '0.0.0.0',
    index: 1
  },
  isA: {
    type: Boolean,
    default: false
  },
  records: {
    type: Array,
    required: true
  },
  category: {
    type: String,
    default: 'undefined'
  }
});
answersheetsSchema.pre('save', function(next) {
  let num = 0;
  for (let answer in this.records) {
    if (answer.correct) {
      num++;
    }
  }
  this.score = num;
  next();
})

let AnswerSheet = mongoose.model('answersheets', answersheetsSchema);
let t1 = Date.now();
console.log('开始读取数据');

db.query(`
for a in answersheets
filter a._key && a.records
return a
`)
.then(curtor => curtor.all())
.then((res) => {
  console.log('数据读取完成，开始写入数据');
  let n = 0;
  let toMongo = () => {
    let data = res[n];
    let answersheet = new AnswerSheet({
      key: data._key,
      category: data.category,
      ip: data.ip,
      isA: data.isA,
      records: data.records,
      score: data.score,
      toc: data.toc,
      tsm: data.tsm,
      uid: data.uid
    });
    answersheet.save()
    .then(() => {
      n++;
      if(n >= res.length) {
        let t2 = Date.now();
        console.log(`${res.length}条数据写入完成，耗时：${t2-t1}ms`);
        return;
      }else{
        toMongo();
        return;
      }
    })
    .catch((err) => {
      console.log(`存数据出错:${err}`)
    });
  }
  toMongo();
})
.catch((err) => {
  console.log(`出错:${err}`);
})