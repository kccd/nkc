const db = require('../../dataModels');
//获取不存在tUid的专栏文章引用并将引用的文章作者uid和引用tUid同步
async function run() {
  console.log(`正在更新专栏引用...`);
  const columnPosts = await db.ColumnPostModel.find({
    tUid: {
      $exists: false
    }
  });
  const tidArr = [];
  const aidArr = [];
  const pidArr = [];
  const threadObj = {};
  const articleObj = {};
  const postObj = {};
  const {thread: threadType, article: articleType, post: postType} = await db.ColumnPostModel.getColumnPostTypes();
  for(const c of columnPosts) {
    if(c.type === threadType) {
      tidArr.push(c.pid);
    } else if(c.type === articleType) {
      aidArr.push(c.pid);
    } else if(c.type === postType) {
      pidArr.push(c.pid);
    }
  }
  const threads = await db.ThreadModel.find({oc: {$in: tidArr}}, {
    oc: 1,
    uid: 1
  });
  const articles = await db.ArticleModel.find({_id: {$in: aidArr}}, {
    uid: 1
  });
  const posts = await db.PostModel.find({pid: {$in: pidArr}}, {
    pid: 1,
    uid: 1,
  });
  for(const thread of threads) {
    threadObj[thread.oc] = thread;
  }
  for(const article of articles) {
    articleObj[article._id] = article;
  }
  for(const post of posts) {
    postObj[post.pid] = post;
  }
  for(const c of columnPosts) {
    let thread;
    if(c.type === threadType) {
      thread = threadObj[c.pid];
    } else if(c.type === articleType) {
      thread = articleObj[c.pid];
    } else {
      thread = postObj[c.pid];
    }
    if(thread) {
      await c.updateOne({
        $set: {
          tUid: thread.uid,
        }
      });
    }
  }
}

run()
  .then(() => {
    console.log('完成');
    process.exit(0);
  })
  .catch(console.error)
