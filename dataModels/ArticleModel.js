const mongoose = require('../settings/database');

const articleSources = {
  column: 'column'
};

const articleStatus = {
  normal: 'normal',
  'default': 'default',
  deleted: 'deleted',
  cancelled: 'cancelled'
};

const schema = new mongoose.Schema({
  _id: String,
  // 文章创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 文章最后修改时间
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  // 发表人
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // document did
  did: {
    type: Number,
    default: null,
    index: 1
  },
  // 文章状态
  // normal: 正常的（已发布，未被删除）
  // default: 未发布的（正在编辑，待发布）
  // deleted: 被删除的（已发布，但被删除了）
  // cancelled: 被取消发表的（未发布过，在草稿箱被删除）
  status: {
    type: String,
    default: articleStatus.default,
    index: 1,
  },
  // 当前文章是否包含草稿
  hasDraft: {
    type: Boolean,
    default: true,
    index: 1
  },
  // 引用文章的模块类型
  source: {
    type: String, // column, alone
    required: true,
    index: 1
  },
  // 引用文章的模块类型所对应的 ID
  sid: {
    type: String,
    default: '',
    index: 1
  },
  // 其他引用模块类型
  references: {
    type: Array,
    default: [],
    index: 1
  }
}, {
  collection: 'articles'
});

/*
* 获取 status
* */
schema.statics.getArticleStatus = async () => {
  return articleStatus;
};

/*
* 获取 source
* */
schema.statics.getArticleSources = async () => {
  return articleSources;
};

/*
* 检验 status 是否合法
* @param {String} status 状态
* */
schema.statics.checkArticleStatus = async (status) => {
  const ArticleModel = mongoose.model('articles');
  const articleStatus = await ArticleModel.getArticleStatus();
  if(!Object.values(articleStatus).includes(status)) {
    throwErr(500, `article status error. status=${status}`);
  }
}
/*
* 检验 source 是否合法
* @param {String} source 来源
* */
schema.statics.checkArticleSource = async (source) => {
  const ArticleModel = mongoose.model('articles');
  const articleSources = await ArticleModel.getArticleSources();
  if(!Object.values(articleSources).includes(source)) {
    throwErr(500, `article source error. source=${source}`);
  }
};


/*
* 向 book 中添加文章，创建 article、document
* @param {Object} props
*   @param {String} title 文章标题，可为空
*   @param {String} content 文章富文本内容，可为空
*   @param {String} uid 作者，不可为空
*   @param {File} coverFile 新的封面图文件对象
*   @param {String} keywords 关键字中文
*   @param {String} keywordsEN 英文关键字
*   @param {String} abstract 摘要中文
*   @param {String} abstractEN 摘要英文
*   @param {Boolean} origin 是否原创
* @return {Object} 创建的 article 对象
* */
schema.statics.createArticle = async (props) => {
  const {
    uid,
    title,
    content,
    coverFile,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin,
    source,
    sid
  } = props;
  const toc = new Date();
  const ArticleModel = mongoose.model('articles');
  const SettingModel = mongoose.model('settings');
  const DocumentModel = mongoose.model('documents');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  const aid = await SettingModel.getNewId();
  const document = await DocumentModel.createBetaDocument({
    uid,
    coverFile,
    title,
    content,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin,
    toc,
    source: documentSource,
    sid: aid,
  });
  const article = new ArticleModel({
    _id: aid,
    uid,
    toc,
    did: document.did,
    source,
    sid,
    status: await ArticleModel.getArticleStatus().default,
  });
  await article.save();
  return article;
}
schema.methods.getBetaDocumentCoverId = async function() {
  const DocumentModel = mongoose.model('documents');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  const betaDocument = await DocumentModel.getBetaDocumentBySource(documentSource, this._id);
  return betaDocument? betaDocument.cover: '';
};
schema.statics.deleteColumnAricleByArticleId = async (aid)=>{
  const DocumentModel = mongoose.model('documents');
  const ArticleModel = mongoose.model('articles');
  /// document 放到doucument上进行更改

  // const publishedColumn = await DocumentModel.getStableDocumnetBySid(aid);
  let updateKey = {hasDraft: false, status: 'cancelled', tlm: new Date()}
  // if(publishedColumn) updateKey.status = 'deleted'
  const source = (await ArticleModel.getArticleSources()).column
  await ArticleModel.updateOne(
    {
      _id: aid,
      source
    }, {
      $set:updateKey
    })
  await DocumentModel.setBetaAsHistoryDocumentById(aid)

  // 如果columnArticles 有两条数据 那么 一定是有一个 编辑版 一个发布版吗
}
/*
* 修改article
* @param {Object} props
*   @param {String} title 文章标题，可为空
*   @param {String} content 文章内容，可为空
*   @param {String} cover 原封面 ID，可为空
*   @param {File} coverFile 新的封面图文件对象
*   @param {String} keywords 关键字中文
*   @param {String} keywordsEN 英文关键字
*   @param {String} abstract 摘要中文
*   @param {String} abstractEN 摘要英文
*   @param {Boolean} origin 是否原创
* */
schema.methods.modifyArticle = async function(props) {
  const DocumentModel = mongoose.model('documents');
  const {
    title,
    content,
    coverFile,
    cover,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin
  } = props;
  const {did} = this;
  const toc = new Date();
  //更改document
  await DocumentModel.updateDocumentByDid(did, {
    title,
    content,
    cover,
    coverFile,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin,
    tlm: toc,
  });
  await this.updateOne({
    $set: {
      tlm: toc
    }
  });
}
/*
* 发布 article
* 如果有正式版就将正式版设为历史
* 将测试版设为正式版
* */
schema.methods.publishArticle = async function() {
  const DocumentModel = mongoose.model('documents');
  const {did} = this;
  await DocumentModel.publishDocumentByDid(did);
}

schema.methods.getStableDocId = async function () {
  const {did} = this;
  const DocumentModel = mongoose.model('documents');
  const document = await DocumentModel.findOne({
    did,
    type: 'stable'
  });
  return document? document._id: null
}

schema.methods.getNote = async function() {
  const NoteModel = mongoose.model('notes');
  const stableDocId = await this.getStableDocId();
  return {
    type: 'document',
    targetId: stableDocId,
    notes: await NoteModel.getNotesByDocId(stableDocId)
  }
}
/*
* 保存 article
* 将测试版变为历史版
* */
schema.methods.saveArticle = async function() {
  const DocumentModel = mongoose.model('documents');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  await DocumentModel.copyBetaToHistoryBySource(documentSource, this._id);
}
schema.statics.checkArticleInfo = async (article) => {
  const {title, content} = article;
  const {checkString} = require('../nkcModules/checkData');
  checkString(title, {
    name: '文章标题',
    minTextLength: 1,
    maxLength: 500
  });
  checkString(content, {
    name: '文章内容',
    maxLength: 200000,
    minTextLength: 1,
    maxTextLength: 10000,
  });
}

schema.methods.getEditorBetaDocumentContent = async function() {
  const DocumentModel = mongoose.model('documents');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  return DocumentModel.getEditorBetaDocumentContentBySource(documentSource, this._id);
};

/*
* 拓展articles
* */
schema.statics.extendArticles = async function(articles) {
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const BooksModel = mongoose.model('books');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const articlesId = [];
  for(const article of articles) {
    articlesId.push(article._id);
  }
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
  const bookObj = {};
  const books = await BooksModel.find({list: {$in: articlesId}});
  for(const book of books) {
    articlesId.map(id => {
      if(book.list.includes(id)) {
        bookObj[id] = book;
      }
    })
  }
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
    const {title, did} = document;
    const result = {
      _id,
      uid,
      bid: bookObj[article._id]._id,
      published: !!stableDocument,
      hasBeta: !!betaDocument,
      title: title || '未填写标题',
      bookUrl: `/book/${bookObj[article._id]._id}`,
      bookName:  bookObj[article._id].name,
      url: getUrl('bookContent', bookObj[article._id]._id, article._id),
      time: timeFormat(toc),
      did,
    };
    results.push(result);
  }
  return results;
}

schema.statics.getBetaDocumentsObjectByArticlesId = async function(articlesId) {
  const DocumentModel = mongoose.model('documents');
  const {article: articleSource} = await DocumentModel.getDocumentSources();
  const betaDocuments = await DocumentModel.getBetaDocumentsBySource(articleSource, articlesId);
  const betaDocumentsObj = {};
  for(const document of betaDocuments) {
    betaDocumentsObj[document.sid] = document;
  }
  return betaDocumentsObj;
}

/*
* 拓展独立文章列表，用于显示文章列表
* @param {[Article]}
* @return {[Object]}
*   @param {String} articleSource 文章来源
*   @param {String} articleSourceId 来源 ID
*   @param {String} articleId 文章 ID
*   @param {String} title 文章标题
*   @param {String} content 文章摘要
*   @param {String} coverUrl 封面图链接
*   @param {String} time 格式化之后的文章内容创建时间
*   @param {String} mTime 格式化之后的文章内容最后修改时间
*   @param {Object} column
*     @param {Number} _id 专栏 ID
*     @param {String} name 专栏名称
*     @param {String} description 专栏介绍
*     @param {String} homeUrl 专栏首页链接
* */
schema.statics.extendArticlesList = async (articles) => {
  const DocumentModel = mongoose.model('documents');
  const ArticleModel = mongoose.model('articles');
  const ColumnModel = mongoose.model('columns');
  const nkcRender = require("../nkcModules/nkcRender");
  const tools = require('../nkcModules/tools');
  const {column: columnSource} = await ArticleModel.getArticleSources();
  const articlesId = [];
  const columnsId = [];
  for(const article of articles) {
    const {_id, source, sid} = article;
    articlesId.push(_id);
    if(source === columnSource) {
      columnsId.push(sid);
    }
  }
  const {article: articleSource} = await DocumentModel.getDocumentSources();
  const stableDocumentsObj = await DocumentModel.getStableDocumentsBySource(articleSource, articlesId, 'object');
  const columnsObj = await ColumnModel.getColumnsById(columnsId, 'object');

  const articlesList = [];
  for(const article of articles) {
    const {_id: articleId, source, sid} = article;
    const stableDocument = stableDocumentsObj[articleId];
    if(!stableDocument) continue;
    let column = null;
    if(source === columnSource) {
      const targetColumn = columnsObj[sid];
      if(targetColumn) column = {
        _id: targetColumn._id,
        name: targetColumn.name,
        description: targetColumn.description,
        homeUrl: tools.getUrl('columnHome', targetColumn._id)
      };
    }
    articlesList.push({
      articleSource: source,
      articleSourceId: sid,
      articleId,
      title: stableDocument.title,
      content: nkcRender.htmlToPlain(stableDocument.content, 200),
      coverUrl: stableDocument.cover? tools.getUrl('document', stableDocument.cover): '',
      time: tools.timeFormat(stableDocument.toc),
      mTime: tools.timeFormat(stableDocument.tlm),
      column,
    });
  }
  return articlesList;
}

/*
* 更改article的hasDraft字段状态
* @param {Boolean} type 要改变的状态
* */
schema.methods.changeHasDraftStatus = async function() {
  const {did, uid} = this;
  const DocumentModel = mongoose.model('documents');
  const {article} = await DocumentModel.getDocumentSources();
  const {beta} = await DocumentModel.getDocumentTypes();
  const documents = await DocumentModel.find({did, uid, source: article, type: beta});
  await this.updateOne({
    $set: {
      hasDraft: documents.length !== 0?true:false,
    }
  });
}

// const articlesOptions = {
//   _id: false,
//   uid: false,
//   cover: false,
//   title: false,
//   content: false,
//   keywordsEN: false,
//   keywords: false,
//   abstractEN: false,
//   abstract: false,
//   wordCount: false,
//   ip: false,
//   port: false,
//   did: false,
//   toc: false,
//   type: false,
//   source: false,
//   sid: false,
//   atUsers: false
// }

/*
* 拓展article下的document
* @param {Object} articles 需要拓展document的article
* @param {Array} options article需要拓展document的内容
* */
schema.statics.extendDocumentsOfArticles = async function(articles, options) {
  const DocumentModel = mongoose.model('documents');
  const arr = [];
  const obj = {};
  const _articles = [];
  for(const article of articles) {
    if(article.type === 'deletes') continue;
    arr.push(article.did);
  }
  const {beta} = await DocumentModel.getDocumentTypes();
  const {article} = await DocumentModel.getDocumentSources();
  const documents = await DocumentModel.find({did: {$in: arr}, type: beta, source: article});
  for(const document of documents) {
    const {_id, uid, cover, title, content, keywordsEN, keywords, abstractEN, abstract, wordCount, ip, port, did, toc, type, source, sid, atUsers} = document;
    const a = {};
    for(const t of options) {
      a[t] = document[t];
    }
    obj[document.did] = a;
  }
  for(const article of articles) {
    const {_id, did, toc, status, hasDraft, sid, uid, source} = article;
    const document = obj[article.did];
    _articles.push(Object.assign({
      _id,
      did,
      toc,
      status,
      hasDraft,
      sid,
      uid,
      source,
    }, document))
  }
  return _articles;
}

module.exports = mongoose.model('articles', schema);
