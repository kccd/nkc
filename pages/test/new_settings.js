const {SettingModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');

const t = Date.now();

const returnMax = (arr) => {
  let max = 0;
  for (let i in arr) {
    console.log(arr[i]);
    if(max < parseFloat(arr[i])) max = parseFloat(arr[i])
  }
  return max;
};

const init = async () => {
  let total = await db.query(`
    for t in settings
    collect with count into length
    return length
  `);
  total = await total.all();
  return total;
};
const moveData = async (total, begin, count) => {
  let t1 = Date.now();
  console.log(`开始读取数据（${begin} - ${begin + count}）`);
  let data = await db.query(`
    for s in settings
    limit ${begin}, ${count}
    return s
  `);
  let arr = await db.query(`
    let rArr = (for r in resources
      return r._key)
    let uArr = (for u in users
      return u._key)
    let pArr = (for p in posts
      return p._key)
    let ttArr = (for t in threadtypes
      return t._key)
    let tArr = (for t in threads
      return t._key)
    let question = length(questions)
    let sms = length(sms)
    let collection = length(collections)
    return {
      rArr,
      uArr,
      pArr,
      ttArr,
      tArr,
      question,
      sms,
      collection
    }          
  `);
  arr = await arr.all();
  data = await data.all();
  console.log(`计算最大值...`);
  arr = arr[0];
  data[0].counters = {};
  data[0].counters.resources = returnMax(arr.rArr);
  data[0].counters.users = returnMax(arr.uArr);
  data[0].counters.threads = returnMax(arr.tArr);
  data[0].counters.posts = returnMax(arr.pArr);
  data[0].counters.threadTypes = returnMax(arr.ttArr);
  data[0].counters.questions = arr.question;
  data[0].counters.sms = arr.sms;
  data[0].counters.collections = arr.collection;
  console.log('开始写入...');
  let n = 0;
  for (let d of data){

    // 处理数据=================
    n++;
    d.uid = d._key;
    d._id = undefined;
    //=========================

    const newSetting = new SettingModel(d);
    try {
      await newSetting.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch (e) {
      return {e, d};
    }
  }
};

begin(init, moveData);