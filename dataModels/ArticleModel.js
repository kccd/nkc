const mongoose = require('../settings/database');
const moment = require('moment');

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
  // 文章阅读量
  hits: {
    type: Number,
    default: 0,
  },
  // 支持数
  voteUp: {
    type: Number,
    default: 0,
  },
  // 反对数
  voteDown: {
    type: Number,
    default: 0,
  },
  // 评论数
  comment: {
    type: Number,
    default: 0,
  },
  // 其他引用模块类型
  references: {
    type: String,
    default: [],
    index: 1
  },
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
* 获取新的 article id
* @return {String}
* */
schema.statics.getNewId = async () => {
  const ArticleModel = mongoose.model('articles');
  const redLock = require('../nkcModules/redLock');
  const getRedisKeys = require('../nkcModules/getRedisKeys');
  const {getRandomString} = require('../nkcModules/apiFunction');
  const key = getRedisKeys('newArticleId');
  let newId = '';
  let n = 10;
  const lock = await redLock.lock(key, 10000);
  try{
    while(true) {
      n = n - 1;
      const _id = getRandomString('a0', 6);
      const article = await ArticleModel.findOne({
        _id
      }, {
        _id: 1
      });
      if(!article) {
        newId = _id;
        break;
      }
      if(n === 0) {
        break;
      }
    }
  } catch(err) {}
  await lock.unlock();
  if(!newId) {
    throwErr(500, `article id error`);
  }
  return newId;
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
    cover,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin
  } = props;
  const toc = new Date();
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const {article: documentSource} = await DocumentModel.getDocumentSources();
  const aid = await ArticleModel.getNewId();
  const document = await DocumentModel.createBetaDocument({
    uid,
    coverFile,
    title,
    content,
    cover,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin,
    toc,
    source: documentSource,
    sid: aid
  });
  const article = new ArticleModel({
    _id: aid,
    uid,
    toc,
    did: document.did,
    status: 'default',
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
*   @param {String} articleUrl 文章链接
*   @param {Number} hits 阅读量
*   @param {Number} voteUp 点赞数
*   @param {Number} comment 评论数
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
    const {
      _id: articleId,
      source,
      sid,
      voteUp,
      hits,
      comment,
    } = article;
    const stableDocument = stableDocumentsObj[articleId];
    if(!stableDocument) continue;
    let column;
    let articleUrl = tools.getUrl('aloneArticle', articleId);
    if(source === columnSource) {
      const targetColumn = columnsObj[sid];
      if(targetColumn) {
        column = {
          _id: targetColumn._id,
          name: targetColumn.name,
          description: targetColumn.description,
          homeUrl: tools.getUrl('columnHome', targetColumn._id)
        };
        articleUrl = tools.getUrl('columnArticle', column._id, articleId);
      }
    }
    articlesList.push({
      articleSource: source,
      articleSourceId: sid,
      articleId,
      articleUrl,
      voteUp,
      hits,
      comment,
      title: stableDocument.title,
      content: nkcRender.htmlToPlain(stableDocument.content, 200),
      coverUrl: stableDocument.cover? tools.getUrl('documentCover', stableDocument.cover): '',
      time: moment(stableDocument.toc).format(`YYYY/MM/DD`),
      mTime: tools.fromNow(stableDocument.tlm),
      column,
    });
  }
  return articlesList;
}

/*
* 拓展独立文章草稿页列表，用于显示文章草稿列表
* @param {[Article]}
* @return {[Object]}
*   @param {String} type 表示草稿类型 create(新写文章) modify(编辑文章)
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
schema.statics.extendArticlesDraftList = async (articles) => {
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const ColumnModel = mongoose.model('columns');
  const nkcRender = require('../nkcModules/nkcRender');
  const tools = require('../nkcModules/tools');
  const {column: columnSource} = await ArticleModel.getArticleSources();
  const {article: articleSource} = await DocumentModel.getDocumentSources();
  const articlesId = [];
  const columnsId = [];
  for(const article of articles) {
    if(article.source === columnSource) {
      columnsId.push(article.sid);
    }
    articlesId.push(article._id);
  }
  const betaDocumentsObject = await DocumentModel.getBetaDocumentsBySource(
    articleSource,
    articlesId,
    'object'
  );
  const columnsObj = await ColumnModel.getColumnsById(columnsId, 'object');
  const results = [];
  for(const article of articles) {
    const betaDocument = betaDocumentsObject[article._id];
    if(!betaDocument) continue;
    let column;
    if(article.source === columnSource) {
      const targetColumn = columnsObj[article.sid];
      if(targetColumn) {
        column = {
          _id: targetColumn._id,
          name: targetColumn.name,
          description: targetColumn.description,
          homeUrl: tools.getUrl('columnHome', targetColumn._id)
        };
      }
    }
    const {
      title,
      content,
      toc,
      tlm,
      cover,
    } = betaDocument;
    const {
      _id: articleId,
      status,
    } = article;

    results.push({
      type: status === 'default'? 'create': 'modify',
      articleId,
      title,
      content: nkcRender.htmlToPlain(content, 200),
      coverUrl: tools.getUrl('documentCover', cover),
      column,
      time: moment(toc).format(`YYYY/MM/DD`),
      mTime: tools.fromNow(tlm),
    });
  }
  return results;
};

/*
* 通过article获取document信息
* @param {Object} article 数据库查询到的article
* */
schema.methods.getDocumentForArticle = async function() {
  const DocumentModel = mongoose.model('documents');
  const {did} = this;
  const document = await DocumentModel.findOnly({did});
  const {
    _id,
    uid,
    status,
    title,
    content,
    coverFile,
    cover,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin,
    wordCount,
    sid,
    source,
    type,
  } = document;
  return {
    _id,
    uid,
    status,
    title,
    content,
    coverFile,
    cover,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin,
    wordCount,
    sid,
    source,
    type
  }
}

module.exports = mongoose.model('articles', schema);
