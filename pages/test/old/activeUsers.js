let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.111');
db.useDatabase('rescue');

const activeUserSchema = new Schema({
  lWThreadCount: {
    type: Number,
    default: 0
  },
  lWPostCount: {
    type: Number,
    default: 0
  },
  vitality: {
    type: Number,
    default: 0,
    index: 1
  },
  uid: {
    type: String,
    unique: true,
    required: true
  }
});


let ActiveUser = mongoose.model('activeUsers', activeUserSchema, 'activeUsers');
let t1 = Date.now();
console.log('开始读取数据');

db.query(`
for a in activeusers
return a
`)
  .then(curtor => curtor.all())
  .then((res) => {
    console.log('数据读取完成，开始写入数据');
    let n = 0;
    let toMongo = () => {
      let data = res[n];
      data._id = undefined;
      let activeUser = new ActiveUser(data);
      activeUser.save()
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