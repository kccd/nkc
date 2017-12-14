const {QuestionModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');

const t = Date.now();

const init = async () => {
  console.log('将已删除用户的数据转移到用户74165 ...');
  await db.query(`
    for q in questions
    filter !document(users, q.uid)
    update q with{uid: '74365'} in questions
  `);
  let total = await db.query(`
    for q in questions
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
    for q in questions
    limit ${begin}, ${count}
    return q
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;
  for (let d of data){
    number++;
    // 处理数据=================
    n++;
    d._id = undefined;
    d.qid = number;
    d.category = (!d.category || d.category === 'null' || d.category === null)? 'undefined': d.category;
    //=========================

    const newQuestion = new QuestionModel(d);
    try {
      await newQuestion.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch (e) {
      return {e, d};
    }
  }
};

begin(init, moveData);