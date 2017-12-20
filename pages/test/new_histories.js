const {HistoriesModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');
const t = Date.now();

const init = async () => {
  console.log('添加fid ...');
  await db.query(`
    for h in histories
    let p = document(posts, h.pid)
    filter p && p.fid
    update h with {fid: p.fid} in histories
  `);
  console.log('修复l字段...');
  await db.query(`
    for h in histories
    filter h.fid && !h.l
    let p = document(posts, h.pid)
    update h with {l: p.l} in histories
  `);
  let total = await db.query(`
    for h in histories
    filter h.fid
    collect with count into length
    return length
  `);
  return await total.all();
};

const moveData = async (total,begin, count) => {
  let t1 = Date.now();
  console.log(`开始读取数据（${begin} - ${begin + count}）`);
  let data = await db.query(`
    for h in histories
    filter h.fid
    limit ${begin}, ${count}
    return h
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;
  for (let d of data) {

    n++;
    d._id = undefined;

    const newHistory = new HistoriesModel(d);
    try{
      await newHistory.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch(e) {
      return {e, d};
    }
  }
};

begin(init, moveData);