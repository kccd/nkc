const mongoose = require('../settings/database');
const {getUrl} = require("../nkcModules/tools");
const {htmlToPlain} = require("../nkcModules/nkcRender");
const commentSource = {
        article: 'article',
        book: 'book'
      };
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
* 获取comment source
* */
schema.statics.getCommentSources = async function() {
  return commentSource;
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
  const {uid, content, sid, ip, port, quoteDid} = options;
  const toc = new Date();
  const DocumentModel = mongoose.model('documents');
  const SettingModel = mongoose.model('settings');
  const CommentModel = mongoose.model('comments');
  const {comment: commentSource}  = await DocumentModel.getDocumentSources();
  const {article: articleSource} = await CommentModel.getCommentSources();
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
    source: articleSource,
    sid,
    did: document.did,
  });
  //如果存在引用就及那个引用信息插入到document中
  if(quoteDid) {
    await document.initQuote(quoteDid)
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
  const {content, quoteDid} = props;
  const {did} = this;
  const tlm = new Date();
  await DocumentModel.updateDocumentByDid(did, {
    quoteDid,
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
* 拓展展示的comment评论数据
* @param {object} props
* props: {
*   comments {object} 需要拓展的评论
*   uid {string} 当前用户的uid
* }
* */
schema.statics.extendPostComments = async (props) => {
  const ReviewModel = mongoose.model('reviews');
  const {comments, uid, isModerator = '', permissions = {}} = props;
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
  const {comment: commentSource} = await DocumentModel.getDocumentSources();
  const {stable: stableType} = await DocumentModel.getDocumentTypes();
  const {normal: normalStatus} = await DocumentModel.getDocumentStatus();
  const documents = await DocumentModel.find({did: {$in: didArr}, source: commentSource, type: stableType});
  for(const d of documents) {
    //用户是否具有审核权限
    if(!permissions.reviewed) {
      if(d.uid !== uid) {
        if((d.status !== normalStatus || d.type !== stableType) && !isModerator) continue;
      }
    }
    let review;
    if(d.status === 'faulty' || d.status === 'unknown') {
      review = await ReviewModel.findOne({docId: d._id}).sort({toc: -1}).limit(1);
    }
    if(d.quoteDid) quoteIdArr.push(d.quoteDid);
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
    const {uid, toc, content, _id, sid, did, tlm} = document;
    const comment = await CommentModel.findOne({did});
    const user = await UserModel.findOne({uid});
    const {username, avatar} = user;
    quoteObj[document._id] = {
      cid: comment._id,
      uid,
      toc,
      tlm,
      content: htmlToPlain(content, 100),
      docId: _id,
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
    const userGrade = await user.extendGrade();
    if(!documentObj[c.did]) continue;
    const m = c.toObject();
    _comments.push({
      ...m,
      content: await CommentModel.renderComment(documentObj[c.did]._id),
      docId: documentObj[c.did]._id,
      status: documentObj[c.did].status,
      type: documentObj[c.did].type,
      reason: documentObj[c.did]?documentObj[c.did].reason:null, //审核原因
      tlm: documentObj[c.did].tlm,
      user: {
        uid: user.uid,
        username: user.username,
        avatar: getUrl('userAvatar', user.avatar),
        userHome: `/u/${user.uid}`,
        gradeId: userGrade._id,
        gradeName: userGrade.displayName,
      },
      isAuthor: m.uid === uid?true:false,
      quote: documentObj[c.did].quote || null,
    });
  }
  return _comments;
}


/*
* 拓展审核comment信息
* */
schema.statics.extendReviewComments = async function(comments) {
  const CommentModel = mongoose.model('comments');
  const ColumnPostModel = mongoose.model('columnPosts');
  const DocumentModel = mongoose.model('documents');
  const ArticleModel = mongoose.model('articles');
  const {comment: documentSource} = await DocumentModel.getDocumentSources();
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const commentsId = [];
  const articleSid = [];
  const articleId = [];
  const didArr = [];
  for(const comment of comments) {
    if(!comment) continue;
    commentsId.push(comment._id);
    articleSid.push(comment.sid);
  }
  const articles = await ArticleModel.find({_id: {$in: articleSid}});
  for(const article of articles) {
    didArr.push(article.did);
    articleId.push(article._id);
  }
  const {article: articleType} = await ColumnPostModel.getColumnPostTypes();
  const columnPosts = await ColumnPostModel.find({pid: {$in: articleId}, type: articleType});
  const columnPostObj = {};
  for(const c of columnPosts) {
    columnPostObj[c.pid] = c;
  }
  const {stable: stableType, beta: betaType} = await DocumentModel.getDocumentTypes();
  const articleDocuments = await DocumentModel.find({did: {$in: didArr}, type: {$in: [stableType, betaType]}});
  const articlesDocumentObj = {};
  for(const d of articleDocuments) {
    const {type, sid} = d;
    if(!articlesDocumentObj[sid]) articlesDocumentObj[sid] = {};
    articlesDocumentObj[sid][type] = d;
  }
  const commentDocuments = await DocumentModel.find({
    type: {
      $in: [betaType, stableType]
    },
    source: documentSource,
    sid: {
      $in: commentsId
    }
  });
  const  commentsObj = {};
  for(const d of commentDocuments) {
    const {type, sid} = d;
    if(!commentsObj[sid]) commentsObj[sid] = {};
    commentsObj[sid][type] = d;
  }
  const results = [];
  for(const comment of comments) {
    if(!comment) continue;
    const {
      _id,
      toc,
      uid,
      sid
    } = comment;
    const commentObj = commentsObj[_id];
    const articleDocumentObj = articlesDocumentObj[sid];
    if(!commentObj || !articleDocumentObj) continue;
    const betaComment = commentObj.beta;
    const stableComment = commentObj.stable;
    const betaArticleDocument = articleDocumentObj.beta;
    const stableArticleDocument = articleDocumentObj.stable;
    if(!stableComment && !betaComment) continue;
    const document = stableComment || betaComment;
    const articleDocument = stableArticleDocument || betaArticleDocument;
    const {did} = document;
    const result = {
      _id,
      uid,
      published: !!stableComment,
      hasBeta: !!betaComment,
      time: timeFormat(toc),
      did,
      url: `/m/${columnPostObj[sid].columnId}/a/${columnPostObj[sid]._id}`,
      title: articleDocument.title,
    };
    results.push(result);
  }
  return results;
}

/*
* 拓展单个需要编辑评论内容
* */
schema.methods.extendEditorComment = async function() {
  const DocumentModel = mongoose.model('documents');
  const CommentModel = mongoose.model('comments');
  const UserModel = mongoose.model('users');
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const {comment: commentSource} = await DocumentModel.getDocumentSources();
  const {beta: betaType, stable: stableType} = await DocumentModel.getDocumentTypes();
  const {did, _id, toc, uid, sid} = this;
  const documents = await DocumentModel.find({did, type: {$in: [betaType, stableType]}, source: commentSource, sid: _id});
  const commentsObj = {};
  const quoteIdArr= [];
  const quoteObj= {};
  for(const document of documents) {
    const {type, sid, quoteDid} = document;
    if(quoteDid) quoteIdArr.push(quoteDid);
    if(!commentsObj[sid]) commentsObj[sid] = {};
    commentsObj[sid][type] = document;
  }
  const quoteDocuments = await DocumentModel.find({_id: {$in: quoteIdArr}});
  for(const document of quoteDocuments) {
    const {uid, toc, content, _id, sid, did, tlm} = document;
    const comment = await CommentModel.findOne({did});
    const user = await UserModel.findOne({uid});
    const {username, avatar} = user;
    quoteObj[document._id] = {
      cid: comment._id,
      uid,
      toc,
      tlm,
      content: htmlToPlain(content, 100),
      docId: _id,
      sid,
      did,
      order: comment.order,
      username,
      avatar: getUrl('userAvatar', avatar),
      userHome: `/u/${user.uid}`
    };
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
    // sid: betaComment?betaComment.sid:stableComment.sid,
    sid,
    type: betaComment?betaComment.type:stableComment.type,
    quoteDid: betaComment?betaComment.quoteDid:stableComment.quoteDid,
    time: timeFormat(toc),
    did,
    quote: quoteObj[betaComment?betaComment.quoteDid:stableComment.quoteDid]
  }
}

/*
* 更新comment的order
* */
schema.methods.updateOrder = async function () {
  const CommentModel = mongoose.model('comments');
  const DocumentModel = mongoose.model('documents');
  const {article: articleSource} = await DocumentModel.getDocumentSources();
  const {sid, order} = this;
  //获取上一个评论的楼层
  const afterComment = await CommentModel.findOne({source: articleSource, sid}).sort({toc: -1}).skip(1).limit(1);
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
* @para {Object} comments 需要拓展的评论
* */
schema.statics.extendComments = async function(comments) {
  const DocumentModel = mongoose.model('documents');
  const UserModel = mongoose.model('users');
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const didArr = [];
  const uidArr = [];
  const documentObj = {};
  const userObj = {};
  for(const c of comments) {
    didArr.push(c.did);
    uidArr.push(c.uid);
  }
  const users = await UserModel.find({uid: {$in: uidArr}});
  for(const user of users) {
    userObj[user.uid] = user;
  }
  const documents = await DocumentModel.find({did: {$in: didArr}, type: 'stable', status: 'normal'});
  for(const d of documents) {
    documentObj[d.did] = d;
  }
  const results = [];
  for(const c of comments) {
    const {did, sid, _id, source, toc, uid} = c;
    const document = documentObj[did];
    const {content, } = document;
    const result = {
      _id,
      did,
      sid,
      source,
      uid,
      url: '',
      time: timeFormat(toc),
      c: content,
      user: userObj[uid],
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
