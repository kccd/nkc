const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 投稿人
  uid: {
    type: String,
    index: 1,
    required: true
  },
  cid: {
    type: [Number],
    required: true,
  },
  mcid: {
    type: [Number],
    default: [],
  },
  // 增加独立文章投稿时，决定放弃，置为空字符串
  // 以source和tid查询
  pid: {
    type: String,
    index: 1
  },
  // 投稿类型
  // thread: 文章
  // article: 文章（包含空间文章、专栏文章等）
  source: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  columnId: {
    type: Number,
    required: true,
    index: 1
  },
  // 与 source 类型对应的 ID
  // source: thread, tid 表示 thread.tid
  // source: article, tid 表示 article._id
  tid: {
    type: String,
    required: true,
    index: 1
  },
  description: {
    type: String,
    default: ""
  },
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  reason: {
    type: String,
    default: ""
  },
  // passed: {
  //   type: Boolean,
  //   default: null,
  //   index: 1
  // }
  passed: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    default: ""
  }
}, {
  collection: "columnContributes"
});

schema.statics.extendContributes = async (contributes) => {
  const UserModel = mongoose.model("users");
  const ThreadModel = mongoose.model("threads");
  const ArticleModel = mongoose.model("articles");
  const ColumnModel = mongoose.model('columns');
  const uid = new Set(), tid = new Set(), articlesId = new Set(), columnsId = new Set();
  contributes.map(c => {
    uid.add(c.uid);
    columnsId.add(c.columnId);
    if (c.source === 'article') {
      articlesId.add(c.tid);
    } else if (c.source === 'thread') {
      tid.add(c.tid);
    }
  });
  const users = await UserModel.find({uid: {$in: [...uid]}});
  let threads = await ThreadModel.find({tid: {$in: [...tid]}});
  let articles = await ArticleModel.find({_id: {$in: [...articlesId]}});
  let columns = await ColumnModel.find({_id: {$in: [...columnsId]}});
  threads = await ThreadModel.extendThreads(threads);
  articles = await ArticleModel.extendArticles(articles);
  const usersObj = {}, threadsObj = {}, articleObj = {}, columnObj = {};
  users.map(user => {
    usersObj[user.uid] = user;
  });
  threads.map(thread => {
    threadsObj[thread.tid] = thread;
  });
  articles.forEach(item=>{
    articleObj[item._id] = item;
  });
  columns.forEach(item=>{
    columnObj[item._id] = item;
  })
  const results = [];
  for(let c of contributes) {
    c = c.toObject();
    if(columnObj[c.columnId]){
      c.column = {name: columnObj[c.columnId].name};
    }
    if (c.source === 'article' && articleObj[c.tid]){
      c.article = articleObj[c.tid];
      results.push(c);
    } else if (c.source === 'thread'){
      c.thread = threadsObj[c.tid];
      if(c.thread.firstPost.anonymous) {
        c.thread.uid = "";
        c.thread.firstPost.uid = "";
        c.thread.firstPost.user = "";
      } else {
        c.user = c.thread.firstPost.user;
      }
      results.push(c);
    }
  }
  return results;
};

schema.statics.extendColumnContributes = async (contributes) => {
  const UserModel = mongoose.model("users");
  const ThreadModel = mongoose.model("threads");
  const ArticleModel = mongoose.model("articles");
  const DocumentModel = mongoose.model("documents");
  const tools = require("../nkcModules/tools");
  const nkcRender = require('../nkcModules/nkcRender');
  const uid = new Set(), thread_tid = new Set(), article_tid = new Set();
  contributes.map(c => {
    uid.add(c.uid);
    if(c.source === 'article'){
      article_tid.add(c.tid);
    }else if(c.source === 'thread'){
      thread_tid.add(c.tid);
    }
  });
  const users = await UserModel.find({uid: {$in: [...uid]}});
  const usersObj = {}, threadsObj = {}, articlesObj = {};
  users.map(user => {
    usersObj[user.uid] = {
      uid: user.uid,
      username: user.username,
      url: tools.getUrl('userHome', user.uid)
    };
  });
  if(thread_tid && thread_tid.size > 0){
    let threads = await ThreadModel.aggregate([
      {
        $match: {
          tid: {$in: [...thread_tid]},
        }
      },
      {
        $sort:{toc:-1}
      },
      {
        $project: {
          tid: 1,
          oc: 1
        }
      },
      {
        $lookup:{
          from: 'posts',
          let: { oc_pid: "$oc" },
          pipeline: [
            { $match:
                { $expr:
                    { $eq: [ "$pid",  "$$oc_pid" ] },
                }
            },
            { $project: {c: 1, pid: 1, t: 1, toc: 1 } }
          ],
          as: "content"
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$content", 0 ] }, "$$ROOT" ] } }
      },
      { $project: { content: 0 } }
    ]);
    threads.map(thread => {
      threadsObj[thread.tid] = {
        tid: thread.tid,
        toc: thread.toc,
        t: thread.t,
        source: 'thread',
        c: nkcRender.htmlToPlain(thread.c,20),
        url: tools.getUrl('thread', thread.tid)
      };
    });
  }
  if(article_tid && article_tid.size > 0){
    const documentSources = await DocumentModel.getDocumentSources();
    const documentTypes = await DocumentModel.getDocumentTypes();
    const articles = await ArticleModel.aggregate([
      {
        $match : {
          _id: {$in: [...article_tid]},
        }
      },
      {
        $sort:{toc:-1}
      },
      {
        $project: {
          did: 1,
          _id: 1,
          source: 1,
        }
      },
      {
        $lookup:{
          from: 'documents',
          let: { did: "$did" },
          pipeline: [
            { $match:
                { $expr:
                    { $and:
                        [
                          { $eq: [ "$did",  "$$did" ] },
                          { $eq: [ "$source", documentSources.article ] },
                          { $eq: [ "$type", documentTypes.stable ] },
                        ]
                    }

                }
            },
            { $project: {title: 1, content: 1, dt: 1 , _id: 0 } }
          ],
          as: "doc"
        }
      },
      {
        $lookup:{
          from: 'columnPosts',
          let: { id: "$_id" },
          pipeline: [
            { $match:
                { $expr:
                    { $eq: [ "$pid",  "$$id" ] },
                }
            },
            { $project: {columnId: 1, article:'$_id', _id: 0 } }
          ],
          as: "columnArticle"
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$doc", 0 ] }, { $arrayElemAt: [ "$columnArticle", 0 ] }, "$$ROOT" ] } }
      },
      { $project: { doc: 0, columnArticle: 0, did: 0 } },
    ]);
    articles.map(article => {
      let url;
      if(article.source === 'zone'){
        url = tools.getUrl('zoneArticle', article._id)
      }else {
        // 投稿处理统一跳转到独立文章页
        url = `/article/${article._id}`;
        // url = tools.getUrl('columnArticle', article.columnId, article.article)
        // if(!article.columnId){
        //   url = `/article/${article._id}`;
        // }
      }
      articlesObj[article._id] = {
        tid: article._id,
        source: 'article',
        toc: article.dt,
        t: article.title,
        c: nkcRender.htmlToPlain(article.content,20),
        url
      };
    });
  }
  const results = [];
  for(let c of contributes) {
    c = c.toObject();
    if(c.source === 'thread') {
      c.thread = threadsObj[c.tid];
    }else if(c.source === 'article'){
      c.thread = articlesObj[c.tid];
    }
    c.user = usersObj[c.uid];
    results.push(c);
  }
  return results;
};
module.exports = mongoose.model("columnContributes", schema);
