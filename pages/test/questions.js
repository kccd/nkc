let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.7');
db.useDatabase('rescue');
let number = 0;
let questionsSchema = new Schema({
  qid:{
    type: Number,
    unique: true,
    required: true
  },
  tlm: {
    type: Date,
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  category: {
    type: String,
    required: true,
    index: 1
  },
  type: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  username: {
    type: String,
    default: ''
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: Array,
    required: true
  }
});
questionsSchema.pre('save', function(next){
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  next();
})

let Question = mongoose.model('questions', questionsSchema);


/* Question.find().$where(function(){
  return this.toc == this.tlm;
})
.then((res) => {
  console.log(res);
  return;
})
return;
 */

let t1 = Date.now();
console.log('开始修复数据');
/*db.query(`
  for q in questions
    filter !q.username
    let u = document(users, q.uid) || {username: ''}
    update q with {
      username: u.username
    } in questions
`)
.then(() => {
  return db.query(`
    for q in questions
      filter q.category == 'null'
      update q with {
        category: 'undefined'
      } in questions
  `)
})
.then(() => {
  console.log(`完成,开始读取数据`);
  return db.query(`
    for i in questions
    filter i.category && i.type && i.uid && i.question && i.answer
    return i
  `);
})*/
db.query(`
  for q in questions
  return q
`)
.then(curtor => curtor.all())
.then((res) => {
  console.log('数据读取完成，开始写入数据');
  let n = 0;
  let toMongo = () => {
    number++;
    let data = res[n];
    let question = new Question({
      qid: number,
      toc: data.toc,
      tlm: data.tlm,
      category: (!data.category || data.category=="null")?'undefined': data.category,
      type: data.type,
      question: data.question,
      answer: data.answer,
      uid: data.uid,
      username: data.username? data.username: 'undefined'
    });
    question.save()
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