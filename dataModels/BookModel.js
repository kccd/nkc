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
    type: [String],
    default: []
  }
}, {
  collection: 'books'
});

schema.statics.checkBookInfo = async (book) => {
  const {name, description} = book;
  const {checkString} = require('../nkcModules/checkData');
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
  const {name, description, uid} = props;
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
schema.methods.getBaseInfo = async function() {
  const {timeFormat, getUrl} = require('../nkcModules/tools');
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
  const book = await BookModel.findOnly({_id: bid});
  return await book.getBaseInfo();
};
schema.statics.getBooksByUserId = async (uid) => {
  const BookModel = mongoose.model('books');
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const books = await BookModel.find({uid, disabled: {$ne: true}});
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
      coverUrl: cover? getUrl('bookCover', cover): ''
    }
  })
};

schema.methods.bindArticle = async function(articleId) {
  await this.updateOne({
    $addToSet: {
      list: `${articleId}`
    }
  });
}

schema.methods.getList = async function() {
  const articles = await this.extendArticlesById(this.list);
  const articlesObj = {};
  for(const a of articles) {
    articlesObj[a._id] = a;
  }
  const results = [];
  for(const aid of this.list) {
    const article = articlesObj[aid];
    if(!article) continue;
    results.push(article);
  }
  return results;
}

schema.methods.extendArticlesById = async function(articlesId) {
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const articles = await ArticleModel.find({_id: {$in: articlesId}});
  const {article: documentSource} = await DocumentModel.getDocumentSources();
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
  for(const d of documents) {
    const {type, sid} = d;
    if (!articlesObj[sid]) articlesObj[sid] = {};
    articlesObj[sid][type] = d;
  }
  const results = [];
  for(const article of articles) {
    const {
      _id,
      toc,
      uid,
    } = article;
    const articleObj = articlesObj[_id];
    if(!articleObj) continue;
    const betaDocument = articlesObj[_id].beta;
    const stableDocument = articlesObj[_id].stable;
    if(!stableDocument && !betaDocument) {
      continue;
    }
    const document = stableDocument || betaDocument;
    const {title} = document;
    const result = {
      _id,
      uid,
      published: !!stableDocument,
      hasBeta: !!betaDocument,
      title: title || '未填写标题',
      url: getUrl('bookContent', this._id, _id),
      time: timeFormat(toc)
    };
    results.push(result);
  }
  return results;
}

schema.methods.getContentById = async function(props) {
  const {aid, uid} = props;
  const {list} = this;
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  if(list.includes(aid)) {
    const article = await ArticleModel.findOnly({_id: aid});
    const {_id} = article;
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