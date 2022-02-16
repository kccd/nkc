const mongoose = require('../settings/database');
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
  // 在同级评论列表中的序号（楼层）
  order: {
    type: Number,
    default: 0,
    index: 1
  },
  // 引用来源（评论所在的系统，例如 article、book 等）
  source: {
    type: String,
    required: true,
    index: 1
  },
  did: {
    type: String,
    required: true,
    index: 1
  },
  // 引用来源 ID
  sid: {
    type: String,
    required: true,
    index: 1
  },
}, {
  collection: 'comments',
  toObject: {
    getters: true,
    virtuals: true
  }
});

schema.virtual('content')
  .get(function() {
    return this._content;
  })
  .set(function(val) {
    return this._content = val
  });

schema.virtual('user')
  .get(function() {
    return this._user;
  })
  .set(function(val) {
    return this._user = val
  });

schema.virtual('quote')
  .get(function() {
    return this._quote;
  })
  .set(function(val) {
    return this._quote = val
  });

schema.virtual('docId')
  .get(function() {
    return this._docId;
  })
  .set(function(val) {
    return this._docId = val
  });

schema.virtual('status')
  .get(function() {
    return this._status;
  })
  .set(function(val) {
    return this._status = val
  });

schema.virtual('type')
  .get(function() {
    return this._type;
  })
  .set(function(val) {
    return this._type = val
  });
schema.virtual('reason')
  .get(function() {
    return this._reason;
  })
  .set(function(val) {
    return this._reason = val
  });

/*
* 获取评论的有效来源
* */
schema.statics.getCommentSources = async () => {
  return {
    article: 'article',
    book: 'book'
  };
}
/*
* 检测来源的合法性
* @param {String} source
* */
schema.statics.checkCommentSource = async (source) => {
  const CommentModel = mongoose.model('comments');
  const sources = await CommentModel.getCommentSources();
  const sourceNames = Object.values(sources);
  if(!sourceNames.includes(source)) throwErr(500, `comment source error. source=${source}`);
};

/*
* 创建comment
* */
schema.statics.createComment = async (options) => {
  const {uid, content, sid, ip, port, quoteCid} = options;
  const toc = new Date();
  const DocumentModel = mongoose.model('documents');
  const SettingModel = mongoose.model('settings');
  const CommentModel = mongoose.model('comments');
  const {comment: commentSource}  = await DocumentModel.getDocumentSources();
  const cid = await SettingModel.getNewId();
  const document = await DocumentModel.createBetaDocument({
    uid,
    content,
    toc,
    source: commentSource,
    sid:  cid,
    ip,
    port
  });
  const comment = new CommentModel({
    _id: cid,
    uid,
    toc,
    source: commentSource,
    sid,
    did: document.did,
  });
  //如果存在引用就及那个引用信息插入到document中
  if(quoteCid) {
    await document.initQuote(quoteCid)
  }
  await comment.save();
  return comment;
}

/*
* 发布comment
* */
schema.methods.publishComment = async function () {
  const DocumentModel = mongoose.model('documents');
  const {did} = this;
  await DocumentModel.publishDocumentByDid(did);
}

/*
* 保存comment
* 将测试版变为历史版
* */
schema.methods.saveComment = async function () {
  const DocumentModel = mongoose.model('documents');
  const {comment: commentSource} = await DocumentModel.getDocumentSources();
  await DocumentModel.copyBetaToHistoryBySource(commentSource, this._id);
}

/*
* 修改comment
* */
schema.methods.modifyComment = async function (props) {
  const DocumentModel = mongoose.model('documents');
  const {content} = props;
  const {did} = this;
  const tlm = new Date();
  await DocumentModel.updateDocumentByDid(did, {
    content,
    tlm
  });
  await this.updateOne({
    $set: {
      tlm,
    }
  });
}
/*
* 拓展图书展示的comment
* */
schema.statics.extendBookComments = async (props) => {
  const ReviewModel = mongoose.model('reviews');
  const {comments, uid, permissions = {}} = props;
  const DocumentModel = mongoose.model('documents');
  const UserModel = mongoose.model('users');
  const {htmlToPlain} = require("../nkcModules/nkcRender");
  const CommentModel = mongoose.model('comments');
  const {getUrl} = require('../nkcModules/tools');
  const didArr = [];
  const uidArr = [];
  const quoteIdArr = [];
  const documentObj = {};
  const usersObj = {};
  const quoteObj = {};
  for(const c of comments) {
    didArr.push(c.did);
    uidArr.push(c.uid);
  }
  const users = await UserModel.find({uid: {$in: uidArr}});
  for(const user of users) {
    usersObj[user.uid] = user;
  }
  const documents = await DocumentModel.find({did: {$in: didArr}, source: 'comment'});
  for(const d of documents) {
    if(!permissions.reviewed) {
      if((d.status !== 'normal' || d.type !== 'stable') && d.uid !== uid) continue;
    }
    let review;
    if(d.status === 'faulty') {
      review = await ReviewModel.findOne({docId: d._id}).sort({toc: -1}).limit(1);
    }
    if(d.status === 'unknown') {
      review = await ReviewModel.findOne({docId: d._id}).sort({toc: -1}).limit(1);
    }
    quoteIdArr.push(d.quoteDid);
    const {content, _id, type, status} = d;
    documentObj[d.did] = {
      content,
      _id,
      type,
      status,
      reason: review?review.reason:'',
    };
  }
  const quoteDocuments = await DocumentModel.find({_id: {$in: quoteIdArr}});
  for(const document of quoteDocuments) {
    const {uid, toc, content, _id, sid, did} = document;
    const comment = await CommentModel.findOne({did});
    const user = await UserModel.findOne({uid});
    const {username, avatar} = user;
    quoteObj[document._id] = {
      uid,
      toc,
      content: htmlToPlain(content, 100),
      _id,
      sid,
      did,
      order: comment.order,
      username,
      avatar: getUrl('userAvatar', avatar),
      userHome: `/u/${user.uid}`
    };
  }
  for(const document of documents) {
    if(!document.quoteDid) continue;
    documentObj[document.did].quote = quoteObj[document.quoteDid];
  }
  const _comments = [];
  for(const c of comments) {
    const user = usersObj[c.uid];
    if(!documentObj[c.did]) continue;
    c.content = await CommentModel.renderComment(documentObj[c.did]._id);
    c.docId =  documentObj[c.did]._id;
    c.status = documentObj[c.did].status;
    c.type = documentObj[c.did].type;
    c.reason = documentObj[c.did]?documentObj[c.did].reason:'',
    c.user = {
      uid: user.uid,
      username: user.username,
      avatar: getUrl('userAvatar', user.avatar),
      userHome: `/u/${user.uid}`
    }
    c.quote = documentObj[c.did].quote;
    const m = c.toObject();
    _comments.push(m);
  }
  return _comments;
}


/*
* 拓展审核comment
* */
schema.statics.extendReviewComments = async function(comments) {
  const CommentModel = mongoose.model('comments');
  const DocumentModel = mongoose.model('documents');
  const BookModel = mongoose.model('books');
  const {comment: documentSource} = await DocumentModel.getDocumentSources();
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const commentsId = [];
  const booksId = [];
  for(const comment of comments) {
    commentsId.push(comment._id);
    booksId.push(comment.sid);
  }
  const documents = await DocumentModel.find({
    type: {
      $in: ['beta', 'stable']
    },
    source: documentSource,
    sid: {
      $in: commentsId
    }
  });
  const  commentsObj = {};
  for(const d of documents) {
    const {type, sid} = d;
    if(!commentsObj[sid]) commentsObj[sid] = {};
    commentsObj[sid][type] = d;
  }
  const results = [];
  const bookObj = {};
  const books = await BookModel.find({_id: {$in: booksId}});
  for(const book of books) {
    bookObj[book._id] = book;
  }
  for(const comment of comments) {
    const {
      _id,
      toc,
      uid,
    } = comment;
    const commentObj = commentsObj[_id];
    if(!commentObj) continue;
    const betaComment = commentObj.beta;
    const stableComment = commentObj.stable;
    if(!stableComment && !betaComment) continue;
    const document = stableComment || betaComment;
    const {did} = document;
    const result = {
      _id,
      uid,
      bid: bookObj[comment.sid]._id,
      published: !!stableComment,
      hasBeta: !!betaComment,
      bookUrl: `/book/${bookObj[comment.sid]._id}`,
      bookName: bookObj[comment.sid].name,
      time: timeFormat(toc),
      did,
    };
    results.push(result);
  }
  return results;
}

/*
* 拓展单个需要编辑的评论内容
* */
schema.methods.extendEditorComment = async function() {
  const DocumentModel = mongoose.model('documents');
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const {comment: documentSource} = await DocumentModel.getDocumentSources();
  const {did, _id, toc, uid} = this;
  const documents = await DocumentModel.find({did, type: {$in: ['beta', 'stable']}, source: documentSource, sid: _id});
  const commentsObj = {};
  for(const document of documents) {
    const {type, sid} = document;
    if(!commentsObj[sid]) commentsObj[sid] = {};
    commentsObj[sid][type] = document;
  }
  const commentObj = commentsObj[_id]
  const stableComment = commentObj.stable;
  const betaComment = commentObj.beta;
  return {
    _id,
    uid,
    docId: betaComment?betaComment._id:stableComment._id,
    content: betaComment?betaComment.content:stableComment.content,
    source: betaComment?betaComment.source:stableComment.source,
    sid: betaComment?betaComment.sid:stableComment.sid,
    time: timeFormat(toc),
    did,
  }
}

/*
* 修改comment的order
* */
schema.methods.updateOrder = async function () {
  const CommentModel = mongoose.model('comments');
  const DocumentModel = mongoose.model('documents');
  const {comment: documentSource} = await DocumentModel.getDocumentSources();
  const {sid, order} = this;
  //获取上一个评论的楼层
  const afterComment = await CommentModel.findOne({source: documentSource, sid}).sort({toc: -1}).skip(1).limit(1);
  if(order === 0) {
    await this.updateOne({
      $set: {
        order: afterComment?afterComment.order + 1:1,
      }
    });
  }
}

/*
*拓展投诉的comments
* */
schema.statics.extendComments = async function(comments) {
  const DocumentModel = mongoose.model('documents');
  const BookModel = mongoose.model('books');
  const UserModel = mongoose.model('users');
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const didArr = [];
  const bookId = [];
  const uidArr = [];
  const documentObj = {};
  const booksObj = {};
  const userObj = {};
  for(const c of comments) {
    didArr.push(c.did);
    bookId.push(c.sid);
    uidArr.push(c.uid);
  }
  const users = await UserModel.find({uid: {$in: uidArr}});
  for(const user of users) {
    userObj[user.uid] = user;
  }
  const documents = await DocumentModel.find({did: {$in: didArr}, type: 'stable', status: 'normal'});
  const books = await BookModel.find({_id: {$in: bookId}});
  for(const d of documents) {
    documentObj[d.did] = d;
  }
  for(const b of books) {
    booksObj[b._id] = b;
  }
  const results = [];
  for(const c of comments) {
    const {did, sid, _id, source, toc, uid} = c;
    const document = documentObj[did];
    const book = booksObj[sid];
    const {content, } = document;
    const result = {
      _id,
      did,
      sid,
      source,
      uid,
      time: timeFormat(toc),
      c: content,
      url: `/book/${book._id}`,
      user: userObj[uid],
      bookName: booksObj[sid].name,
    }
    results.push(result);
  }
  return results;
}

/*
* 渲染图书评论
* */
schema.statics.renderComment = async function(_id) {
  const nkcRender = require('../nkcModules/nkcRender');
  const DocumentModel = mongoose.model('documents');
  const ResourceModel = mongoose.model('resources');
  const document = await DocumentModel.findOnly({_id});
  const resourceReferenceId = await document.getResourceReferenceId();
  const resources = await ResourceModel.getResourcesByReference(resourceReferenceId);
  const c = nkcRender.renderHTML({
    type: 'article',
    post: {
      c: document.content,
      resources,
    },
    source: 'document',
    sid: _id
  });
  return c;
}
module.exports = mongoose.model('comments', schema);
