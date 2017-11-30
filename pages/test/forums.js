let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.111');
db.useDatabase('rescue');

let forumsSchema = new Schema({
  abbr: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: 'null'
  },
  color: {
    type: String,
    default: 'grey'
  },
  countPosts: {
    type: Number,
    default: 0
  },
  countThreads: {
    type: Number,
    default: 0
  },
  countPostsToday: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: ''
  },
  displayName: {
    type: String,
    required: true,
  },
  iconFileName: {
    type: String,
    default: ''
  },
  isVisibleForNCC: {
    type: Boolean,
    default: false
  },
  moderators: {
    type: Array,
    default: []
  },
  order: {
    type: Number,
    default: 0
  },
  parentId: {
    type: String,
    default: ''
  },
  fid: {
    type: String,
    unique: true,
    required: true
  },
  tCount: {
    digest: {
      type: Number,
      default: 0
    },
    normal: {
      type: Number,
      default: 0
    }
  },
  type: {
    type: String,
    required: true
  },
  visibility: {
    type: Boolean,
    default: false
  }
});


let Forums = mongoose.model('forums', forumsSchema);

let t1 = Date.now();

console.log('开始读取数据');
return db.query(`
  for f in forums
  return f
`)

.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    res[i]._id = undefined;
    res[i].fid = res[i]._key;
    res[i].countPosts = res[i].count_posts;
    res[i].countPostsToday = res[i].countPostsToday;
    res[i].countThreads = res[i].count_threads;
    res[i].parentId = (!res[i].parentid || res[i].parentid == '0')?'':res[i].parentid;
    res[i].iconFileName = res[i].icon_filename;
    res[i].displayName = res[i].display_name;
    if(typeof(res[i].displayName) != 'string'){
      res[i].displayName = res[i].displayName.toString();
    }
    if(!res[i].class)
      res[i].class = undefined
  }
  console.log('开始写入数据');
  let n = 0;
  let toMongo = () => {
    let data = res[n];
    let forums = new Forums(data);
    forums.save()
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
