let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.15');
db.useDatabase('rescue');

let personalForumsSchema = new Schema({
  uid: {
    type: String,
    required: true,
    index: 1
  },
  type: {
    type: String,
    default: 'forum'
  },
  abbr: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  descriptionOfForum: {
    type: String,
    required: true
  },
  moderators: {
    type: Array,
    default: []
  },
  recPosts: {
    type: Array,
    default: []
  },
  toppedThreads: {
    type: Array,
    default: []
  },
  announcement: {
    type: String,
    default: ''
  }
});

let PersonalForums = mongoose.model('personalForums', personalForumsSchema,'personalForums');

let t1 = Date.now();
console.log('开始读取数据');
db.query(`
  for p in personalForums
  return p
`)
.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    res[i]._id = undefined;
    res[i].uid = res[i]._key;
    res[i].displayName = res[i].display_name;
    res[i].descriptionOfForum = res[i].description
  }
  console.log('开始写入数据');
  let n = 0;
  let toMongo = () => {
    let data = res[n];
    let personalForums = new PersonalForums(data);
    personalForums.save()
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


//substring(0,6) 