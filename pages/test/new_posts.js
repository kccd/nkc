const {PostModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');

const t = Date.now();

const init = async () => {
  let total = await db.query(`
    for p in posts 
    filter document(threads, p.tid)
    collect with count into length
    return length
  `);
  total = await total.all();
  console.log(`总数：${total}`);
  console.log('将已删除用户的post转移到uid: 74365');
  await db.query(`
    for p in posts
    filter !document(users, p.uid)
    update p with {uid: '74365'} in posts
  `);
  console.log('添加fid');
  await db.query(`
    for p in posts 
    let thread = document(threads, p.tid)
    filter thread
    update p with {fid: thread.fid} in posts
  `);
  return total;
};
const moveData = async (total, begin, count) => {
  let t1 = Date.now();
  console.log(`开始读取数据（${begin} - ${begin + count}）`);
  let data = await db.query(`
    for p in posts
    filter document(threads, p.tid)
    limit ${begin}, ${count}
    return p
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;

  for (let d of data){

    // 处理数据=================
    n++;
    d._id = undefined;
    d.pid = d._key;
    d.c = d.c.toString();
    if(d.rpid) d.rpid = d.rpid[0];
    if(!d.credits || d.credits === null || d.credits === 'null') d.credits = [];
    //=========================

    const newPost = new PostModel(d);
    try {
      await newPost.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch (e) {
      return {e, d};
    }
  }
};

begin(init, moveData);