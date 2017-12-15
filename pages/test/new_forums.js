const {ForumModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');

const t = Date.now();

const init = async () => {
  let total = await db.query(`
    for f in forums
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
    for f in forums
    limit ${begin}, ${count}
    return f
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;

  for (let d of data){

    // 处理数据=================
    n++;
    d._id = undefined;
    d.fid = d._key;
    d.countPosts = d.count_posts;
    d.countPostsToday = d.count_posts_today;
    d.countThreads = d.count_threads;
    d.parentId = (!d.parentid || d.parentid === '0')? '': d.parentid;
    d.iconFileName = d.icon_filename;
    d.displayName = d.display_name;
    if(typeof d.displayName !== 'string') d.displayName = d.displayName.toString();
    d.class = d.class? d.class: undefined;
    //=========================

    const newForum = new ForumModel(d);
    try {
      await newForum.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch (e) {
      return {e, d};
    }
  }
};

begin(init, moveData);