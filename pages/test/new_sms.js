const {SmsModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');
const t = Date.now();

const init = async () => {
  let total = await db.query(`
    for s in sms
    collect with count into length
    return length
  `);
  total = await total.all();
  return total;
};
const moveData = async (total, begin, count) => {
  let t1 = Date.now();
  let number = 0;
  console.log(`开始读取数据（${begin} - ${begin + count}）`);
  let data = await db.query(`
    for s in sms
    limit ${begin}, ${count}
    return s
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;
  for (let d of data){
    number++;
    // 处理数据=================
    n++;
    d._id = undefined;
    d.sid = number;
    if(d.s === 'system' && typeof(d.c) === 'object' && typeof d.viewed !== 'boolean') {
        d.fromSystem = true;
        d.systemContent = d.c;
        d.viewedUsers= d.viewed;
        d.s = '';
        d.c = '';
        d.viewed = false;
    }
    //=========================
    const newSms = new SmsModel(d);
    try {
      await newSms.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch (e) {
      return {e, d};
    }
  }
};

begin(init, moveData);