let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')();
db.useDatabase('rescue');

let smsCodeSchema = new Schema({
  toc: {
    type: Number,
    default: Date.now
  },
  type: {
    type: Number,
    required: true
  },
  code: {
    type: String,
    required: true,
    index: 1
  },
  mobile: {
    type: String,
    required: true,
    index: 1
  }
});

let SmsCode = mongoose.model('smsCodes', smsCodeSchema);


let t1 = Date.now();

console.log('开始读取数据');
return db.query(`
  for s in smscode
  return s
`)

.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    res[i]._id = undefined;
    res[i].mobile = res[i].phone;
    res[i].type = res[i].type?res[i].type:1;
  }
  console.log('开始写入数据');
  let n = 0;
  let m = 0;
  let toMongo = () => {
    let data = res[n];
    let smscode = new SmsCode(data);
    smscode.save()
    .then(() => {
      if(m+1000 == n){
        m = n;
        console.log(n);
      }
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
      console.log(data);
      console.log(`存数据出错:${err}`)
    });
  }
  toMongo();
}) 
.catch((err) => {
  console.log(err);
})
