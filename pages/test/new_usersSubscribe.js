const {UsersSubscribeModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');

const t = Date.now();

const init = async () => {
  console.log('通过users生成数据...');
  await db.query(`
    for u in users
    filter !document(usersSubscribe, u._key)
    insert{_key: u._key, subscribeForums: [], subscribeUsers: [], subscribers: []} in usersSubscribe
  `);
  console.log('转移关注的板块...');
  await db.query(`
    for u in users
    let us = document(usersSubscribe, u._key)
    update us with{subscribeForums: u.focus_forums} in usersSubscribe
  `);
  let total = await db.query(`
    for u in usersSubscribe 
    filter document(users, u._key)
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
    for u in usersSubscribe
    filter document(users, u._key)
    limit ${begin}, ${count}
    return u
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;

  for (let d of data){

    // 处理数据=================
    n++;
    d._id = undefined;
    d.uid = d._key;
    if(d.subscribeForums === null) d.subscribeForums = [];
    if(d.subscribers === null) d.subscribers = [];
    if(d.subscribeUsers === null) d.subscribeUsers = [];
    //=========================

    const newUsersSubscribe = new UsersSubscribeModel(d);
    try {
      await newUsersSubscribe.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch (e) {
      return {e, d};
    }
  }
};

begin(init, moveData);