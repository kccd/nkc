const {InviteModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');
const t = Date.now();

const init = async () => {
  let total = await db.query(`
    for i in invites
    filter i.inviter && i.invitee
    collect with count into length
    return length
  `);
  return await total.all();
};

const moveData = async (total,begin, count) => {
  let t1 = Date.now();
  console.log(`开始读取数据（${begin} - ${begin + count}）`);
  let data = await db.query(`
    for i in invites
    filter i.inviter && i.invitee
    limit ${begin}, ${count}
    return i
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;
  for (let d of data) {

    n++;
    d._id = undefined;

    const newInvite = new InviteModel(d);
    try{
      await newInvite.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch(e) {
      return {e, d};
    }
  }
};

begin(init, moveData);