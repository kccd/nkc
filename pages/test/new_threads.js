const {ThreadModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');

const t = Date.now();

const init = async () => {
  console.log('将已删除用户的thread转移到用户74365 ...');
  await db.query(`
    for t in threads
    filter !document(users, t.uid)
    update t with {uid: "74365"} in threads
  `);
  console.log('添加fid ...');
  await db.query(`
    for t in threads
    filter !t.fid
    let category = document(threadtypes, t.cid)
    filter category
    update t with{fid: category.fid} in threads
  `);
  let total = await db.query(`
    for t in threads
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
    for t in threads
    limit ${begin}, ${count}
    return t
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;

  for (let d of data){

    // 处理数据=================
    n++;
    d._id = undefined;
    d.tid = d._key;
    d.countRemain = d.count_remain;
    d.countToday = d.count_today;
    //=========================

    const newThread = new ThreadModel(d);
    try {
      await newThread.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch (e) {
      return {e, d};
    }
  }
};

begin(init, moveData);