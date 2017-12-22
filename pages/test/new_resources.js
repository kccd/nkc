const {ResourceModel, PostModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');
const aql = require('arangojs').aql;

const t = Date.now();

const init = async () => {
  let total = await db.query(`
    for r in resources
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
    for r in resources
    limit ${begin}, ${count}
    return r
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;
  for (let d of data){

    // 处理数据=================
    n++;
    d.rid = d._key;
    const cursor = await db.query(aql`
      for p in posts
        filter ${d._key} in p.r[*]
      return p._key
    `);
    d.references = await cursor.all();
    if(['jpg', 'png', 'jpeg', 'bmp', 'svg'].indexOf(d.ext) > -1) {
      await Promise.all(d.references.map(ref => PostModel.findOneAndUpdate({pid: ref}, {hasImage: true})))
    }
    d._id = undefined;
    //=========================

    const newResource = new ResourceModel(d);
    try {
      await newResource.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch (e) {
      return {e, d};
    }
  }
};

begin(init, moveData);