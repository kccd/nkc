const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const {
  timeFormat,
  getUrl
} = require("../nkcModules/tools");
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
schema.methods.newExtendArticlesById = async function (articlesId, {
  setUrl = 'bookContent',
  latestTitle = false
}, bookList) {
  console.log(bookList,'newbookList')
  let newbookList = [...bookList]
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
    // articlesObj[sid] = d;
  }

  const results = [];
  for (const article of articles) {
    const {
      did,
      _id,
      toc,
      uid,
    } = article;
    const articleObj = articlesObj[_id];
    // prevView 需要拿到最新编辑数据。根据 sid 进行查找，可能会出现多条 ，根据更改时间找到最新一条
    let latestEditorResult;
    if (latestTitle) {
      const documents = await DocumentModel.find({
        sid: _id
      });
      let time
      let latestEditor;
      for (const obj of documents) {
        if (!time) {
          time = obj.tlm;
          latestEditor = obj
        } else {
          const objTimeToStr = obj.tlm.toString()
          const timeToStr = time.toString()
          new Date(objTimeToStr).getTime() > new Date(timeToStr).getTime() && (latestEditor = obj) && (time = obj.tlm)
        }
      }
      latestEditorResult = latestEditor
    }
    if (!articleObj) continue;
    const betaDocument = articlesObj[_id].beta;
    const stableDocument = articlesObj[_id].stable;
    if (!stableDocument && !betaDocument) {
      continue;
    }
    const document = stableDocument || betaDocument;
    const {
      title
    } = (latestTitle ? latestEditorResult : document);
    const result = {
      _id,
      uid,
      published: !!stableDocument,
      hasBeta: !!betaDocument,
      value: title || '未填写标题',
      url: getUrl(setUrl, this._id, _id, did),
      time: timeFormat(toc),
    };
    results.push(result);
  }
  // 根据 添加进 results 的数据来匹配 bookList  如果 id 一致 就把 result 对象上数据给 bookList
  for (const key in results) {
    if (Object.hasOwnProperty.call(results, key)) {
      const result = results[key];
      function find(data) {
        for (let i in data) {
          const item = data[i]
          console.log(item, result)
          if (item.id === result._id) {
            for (const key in result) {
              if (Object.hasOwnProperty.call(result, key)) {
                const value = result[key];
                item[key] = value
              }
            }
          } else if (item.child && item.child.length) {
            find(item.child)
          }
        }
      }
      find(newbookList)
    }
  }
  return newbookList;
  // return results;
}
schema.methods.getList = async function (options = {
  setUrl: 'bookContent',
  latestTitle: false
}, bookList=[], bid) {
  // const PostModel = mongoose.model('posts');
  const articlesId = [];
  const postsId = [];

  const articleObj = {};
  const postObj = {};

  function find(list) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (item.type === 'article' && item.id) {
          articlesId.push(item.id);
          articleObj[item.type + item.id] = item;
      } else if (item.type === 'post') {
        if(item.id){
          postsId.push(item.id);
          articleObj[item.type + item.id] = item
        }
      }
      if (item.child && item.child.length) {
        find(item.child);
      }
    }
  }
  find(this.list)
  const articles = await this.newExtendArticlesById(articlesId, options, bookList)
  const articlesObj = {};
  for (const a of articles) {

    const results = [];
    return articles || [];
  }
}
 // 为了让预览能服用该方法，对该方法进行了传参，然后进行判断
schema.methods.extendArticlesById = async function (articlesId, {
  setUrl = 'bookContent',
  latestTitle = false
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

  // console.log(articlesObj,'articlesObj')
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
    // prevView 需要拿到最新编辑数据。根据 sid 进行查找，可能会出现多条 ，根据更改时间找到最新一条
    let latestEditorResult;
    if (latestTitle) {
      const documents = await DocumentModel.find({
        sid: _id
      });
      let time
      let latestEditor;
      for (const obj of documents) {
        if (!time) {
          time = obj.tlm;
          latestEditor = obj
        } else {
          const objTimeToStr = obj.tlm.toString()
          const timeToStr = time.toString()
          new Date(objTimeToStr).getTime() > new Date(timeToStr).getTime() && (latestEditor = obj) && (time = obj.tlm)
        }
      }
      latestEditorResult = latestEditor
    }
    if (!articleObj) continue;
    const betaDocument = articlesObj[_id].beta;
    const stableDocument = articlesObj[_id].stable;
    if (!stableDocument && !betaDocument) {
      continue;
    }
    const document = stableDocument || betaDocument;
    const {
      title
    } = (latestTitle ? latestEditorResult : document);
    const result = {
      _id,
      uid,
      published: !!stableDocument,
      hasBeta: !!betaDocument,
      value: title || '未填写标题',
      url: getUrl(setUrl, this._id, _id, did),
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
  } = this;
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const {
    article: documentSource
  } = await DocumentModel.getDocumentSources();
  if (list.includes(aid)) {
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
  }
}
module.exports = mongoose.model('books', schema);