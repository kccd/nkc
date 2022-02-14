const mongoose = require('../settings/database');
const {timeFormat, getUrl} = require("../nkcModules/tools");
const schema = new mongoose.Schema({
  _id: String,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  name: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  cover: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 目录列表
  // 命名规则：type:id
  // postId: post:pid
  // articleId：article:aid
  list: {
    type: [Object],
    default: []
  }
}, {
  collection: 'books'
});

schema.statics.checkBookInfo = async (book) => {
  const {
    name,
    description
  } = book;
  const {
    checkString
  } = require('../nkcModules/checkData');
  checkString(name, {
    name: '文档名称',
    minLength: 1,
    maxLength: 100
  });
  checkString(description, {
    name: '文档介绍',
    minLength: 0,
    maxLength: 1000
  });
}

schema.statics.createBook = async (props) => {
  const {
    name,
    description,
    uid
  } = props;
  const BookModel = mongoose.model('books');
  const SettingModel = mongoose.model('settings');
  const book = BookModel({
    _id: await SettingModel.getNewId(),
    name,
    description,
    uid
  });
  await book.save();
  return book;
};
schema.methods.getBaseInfo = async function () {
  const {
    timeFormat,
    getUrl
  } = require('../nkcModules/tools');
  const {
    _id,
    uid,
    name,
    description,
    cover,
    toc
  } = this;
  return {
    _id,
    uid,
    name,
    description,
    time: timeFormat(toc),
    coverUrl: getUrl('bookCover', cover)
  };
};
schema.statics.getBookById = async (bid) => {
  const BookModel = mongoose.model('books');
  const book = await BookModel.findOnly({
    _id: bid
  });
  return await book.getBaseInfo();
};
schema.statics.getBooksByUserId = async (uid) => {
  const BookModel = mongoose.model('books');
  const {
    timeFormat,
    getUrl
  } = require('../nkcModules/tools');
  const books = await BookModel.find({
    uid,
    disabled: {
      $ne: true
    }
  });
  return books.map(book => {
    const {
      _id,
      name,
      description,
      toc,
      cover
    } = book;
    return {
      _id,
      time: timeFormat(toc),
      name,
      description,
      coverUrl: cover ? getUrl('bookCover', cover) : ''
    }
  })
};
schema.statics.filterList = async function (updateList) {
  let newUpdateList = [...updateList]
  const allowKeys = ['id', 'child', 'title', 'url','type']
  // 过滤数据
  function find(data) {
    data.forEach(item => {
      for (const key in item) {
        if (Object.hasOwnProperty.call(item, key)) {
          if (!allowKeys.includes(key)) {
            Reflect.deleteProperty(item, key)
          }
          if (item.child && item.child.length) {
            find(item.child)
          }
        }
      }
    });
  }
  find(newUpdateList)
  return newUpdateList
}
schema.methods.bindArticle = async function (aid) {
  await this.updateOne({
    $addToSet: {
      list: {
        aid,
        child: []
      }
    }
  });
}
schema.methods.extendBookList = async function () {
  const postsId = new Set();
  const articlesId = new Set();
  const bookList = this.list.toObject();
  // 查找 post 和 aiticle id
  function findId(bookList){
    for (let i = 0; i < bookList.length; i++) {
      const item = bookList[i];
      if(item.type === 'article'){
        articlesId.add(item.id)
      }else if(item.type === 'post'){
        postsId.add(item.id)
      }
      if(item.child && item.child.length){
        findId(item.child)
      }
    }
  }
  findId(bookList);
  const DocumentModel = mongoose.model('documents');
  const PostModel = mongoose.model('posts');
  const posts = await PostModel.find({pid: {$in: [...postsId]}});
  const postsObj = {};
  for(const post of posts) {
    postsObj[post.pid] = post;
  }
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const {
    article: documentSource
  } = await DocumentModel.getDocumentSources();
  const documents = await DocumentModel.find({
    type: {
      $in: ['beta', 'stable']
    },
    source: documentSource,
    sid: {
      $in: [...articlesId]
    }
  });
  const articlesObj = {};
  for (const d of documents) {
    const {
      type,
      sid
    } = d;
    if (!articlesObj[sid]) articlesObj[sid] = {};
    articlesObj[sid][type] = d;
    // articlesObj[sid] = d;
  }
  let _id = this._id
  const that = this
  function setKey(extendItem, documentData){
    extendItem._id = documentData.sid || documentData.tid;
    extendItem.uid = documentData.uid;
    if(documentData.type){
      extendItem.published = documentData.type === "stable" ? true : false;
      extendItem.hasBeta = documentData.type === "beta" ? true : false;
    }
    extendItem.title = documentData.title || documentData.t;
    let urlType = 'bookContent';
    switch (extendItem.type) {
      case 'article':
        urlType = 'bookContent';
        _id = that._id
        break;
      case 'post':
        urlType = 'post';
        _id = extendItem.id
      default:
        break;
    }
    // item.url = getUrl(urlType, this._id, documentData._id);
    extendItem.url = getUrl(urlType, _id, extendItem.id);
    extendItem.time = timeFormat(documentData.toc);
  }
  // 查找 post 和 article 类型并扩展数据
  function find(data) {
    for (let item of data) {
      if (!item) continue;
      if (item.type === "article") {
        //   {_id, uid, published, hasBeta, title, url, time}
        const documentData = articlesObj[item.id]['beta'] || articlesObj[item.id]['stable'];
        setKey(item, documentData)
      }else if( item.type === 'post'){
        const postData = postsObj[item.id];
        setKey(item, postData)
      }
      if (item.child && item.child.length) {
        find(item.child);
      }
    }
  }
  find(bookList)
  return bookList;
}
schema.methods.getList = async function (status ='unpublished') {
  // status  分为 已发布 未发布
  let articles = await this.extendBookList()
  if(status === 'published'){
    // 只显示发布文章 如果父级未发布那么子级也不显示
    function findPublished(data){
      data.forEach((item, i)=>{
        if(!item.published && item.type === 'article'){
          Reflect.deleteProperty(data,i)
        }
        if(item.child && item.child.length){
          findPublished(item.child)
        }
      })
    }
    findPublished(articles)
  }
  return articles || []
}

schema.methods.extendArticlesById = async function (articlesId,options= {
  setUrl :'bookContent',
  latestTitle : false
}, bookList) {
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const {
    timeFormat,
    getUrl
  } = require('../nkcModules/tools');
  const articles = await ArticleModel.find({
    _id: {
      $in: articlesId
    }
  });

  const {
    article: documentSource
  } = await DocumentModel.getDocumentSources();
  const documents = await DocumentModel.find({
    type: {
      $in: ['beta', 'stable']
    },
    source: documentSource,
    sid: {
      $in: articlesId
    }
  });
  const articlesObj = {};
  for (const d of documents) {
    const {
      type,
      sid
    } = d;
    if (!articlesObj[sid]) articlesObj[sid] = {};
    articlesObj[sid][type] = d;
  }
  const results = [];
  for (const article of articles) {
    const {
      did,
      _id,
      toc,
      uid,
      type
    } = article;
    const articleObj = articlesObj[_id];
    if (!articleObj) continue;
    const betaDocument = articlesObj[_id].beta;
    const stableDocument = articlesObj[_id].stable;
    if (!stableDocument && !betaDocument) {
      continue;
    }
    const document = stableDocument || betaDocument;
    const {
      title
    } = document;
    const result = {
      _id,
      uid,
      published: !!stableDocument,
      hasBeta: !!betaDocument,
      title: title || '未填写标题',
      url: getUrl(setUrl, this._id, _id),
      time: timeFormat(toc),
      type
    };
    for (const d of documents) {
      const {
        type,
        sid
      } = d;
    }
    results.push(result);
  }
  return results;
}
schema.methods.getContentById = async function (props) {
  const {
    aid,
    uid
  } = props;
  const {
    list
  } = this.toObject();
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const {
    article: documentSource
  } = await DocumentModel.getDocumentSources();
  let listIds=[]
  function find(data){
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if(item){
        if(item.type === 'article' && item.id){
          listIds.push(item.id)
        }
        if(item.child && item.child.length){
          find(item.child)
        }
      }
    }
  }
  find(list)
  if (listIds.includes(aid)) {
    const article = await ArticleModel.findOnly({
      _id: aid
    });
    const {
      _id
    } = article;
    const {
      did,
      time,
      mTime,
      title,
      content,
      coverUrl,
    } = await DocumentModel.getStableDocumentRenderingContent(documentSource, _id, uid);
    return {
      aid: article._id,
      did,
      coverUrl,
      time,
      mTime,
      title,
      content,
      uid
    }
  }else{
    return {}
  }
}
module.exports = mongoose.model('books', schema);
