let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.23');
db.useDatabase('rescue');

let repliesSchema = new Schema({
  fromPid: {
    type: String,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  toPid: {
    type: String,
    required: true
  },
  toUid: {
    type: String,
    required: true,
    index: 1
  },
/*  viewed: {
    type: Boolean,
    default: false,
  }*/
});

let Replies = mongoose.model('replies', repliesSchema);


let t1 = Date.now();

console.log('开始读取数据');
return db.query(`
  for r in replies
  return r
`)
.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    res[i]._id = undefined;
    res[i].fromPid = res[i].frompid;
    res[i].toPid = res[i].topid;
    res[i].toUid = res[i].touid;
    // res[i].viewed = true;
  }
  console.log('开始写入数据');
  let n = 0;
  let toMongo = () => {
    let data = res[n];
    let replies = new Replies(data);
    replies.save()
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
  console.log(err);
})
