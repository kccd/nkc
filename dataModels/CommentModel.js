const mongoose = require('../settings/database');
const {getUrl} = require("../nkcModules/tools");
const commentSource = {
        article: 'article',

      };
const commentStatus = {
        normal: 'normal',
        'default': 'default',
        deleted: 'deleted',
        cancelled: 'cancelled',
        disabled: 'disabled', //禁用
        faulty: 'faulty', //退修
        unknown: 'unknown',// 未审核
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
  //是否加精
  digest: {
    type: Boolean,
    default: false,
    index:1,
  },
  //加精时间
  digestTime: {
    type: Date,
    default: null,
    index: 1,
  },
  //支持数
  voteUp: {
    type: Number,
    default: 0,
    index: 1
  },
  //反对数
  voteDown: {
    type: Number,
    index:1,
  },
  // disabled: 被禁用的（已发布但被管理员禁用了）
  // faulty: 被退修的 （已发布但被管理员退修了）
  // unknown: 状态位置的 （已发布未审核
  status: {
    type: String,
    default: commentStatus.default,
    index: 1
  },
  // // 引用来源（评论所在的系统，例如 article、book 等）
  // source: {
  //   type: String,
  //   required: true,
  //   index: 1
  // },
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

// schema.virtual('status')
//   .get(function() {
//     return this._status;
//   })
//   .set(function(val) {
//     return this._status = val
//   });

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
* 获取comment状态
* */
schema.statics.getCommentStatus = async function() {
  return commentStatus;
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
* @params {Object} options 创建comment需要的内容
*  @params {string} uid 创建评论的uid
*  @params {string} content 评论的内容
*  @params {string} sid 评论的盒子id
*  @params {string} ip 评论的创建人的ip
*  @params {string} port 评论的创建人的设备端口
*  @params {string} quoteId 评论的引用的内容的id
*  @params {string} source 评论的内容的来源
* */
schema.statics.createComment = async (options) => {
  const {uid, content, aid, ip, port, quoteDid, source} = options;
  const toc = new Date();
  const DocumentModel = mongoose.model('documents');
  const CommentModel = mongoose.model('comments');
  const ArticlePostModel = mongoose.model('articlePosts');
  const {comment: commentDocumentSource}  = await DocumentModel.getDocumentSources();
  //获取新的comment id
  const cid = await CommentModel.getNewId();
  const document = await DocumentModel.createBetaDocument({
    uid,
    content,
    toc,
    source: commentDocumentSource,
    sid:  cid,
    ip,
    port
  });
  // 获取文章引用并将comment绑定到引用上
  const articlePost = await ArticlePostModel.getArticlePostByArticleId({
    sid: aid,
    source,
    uid
  });
  const comment = new CommentModel({
    _id: cid,
    uid,
    toc,
    sid: articlePost._id,
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
* 发布comment, 检测评论的发表权限，不需要审核，即comment的状态为正常时，为评论生成一条新的动态并且通知作者文章文章被评论了
* */
schema.methods.publishComment = async function (article, toColumn, {ip, port}) {
  const DocumentModel = mongoose.model('documents');
  const CommentModel = mongoose.model('comments');
  const MomentModel = mongoose.model('moments');
  const ColumnPostModel = mongoose.model('columnPosts');
  const socket = require('../nkcModules/socket');
  const {did} = this;
  const {normal: normalStatus} = await CommentModel.getCommentStatus();
  const {comment: commentQuoteType} = await MomentModel.getMomentQuoteTypes();
  //检测评论发布权限
  await DocumentModel.checkGlobalPostPermission(this.uid, 'comment');
  await DocumentModel.publishDocumentByDid(did);
  const newComment = await CommentModel.findOnly({_id: this._id});
  //将文章推送到专栏
  if(toColumn) {
    try{
      await ColumnPostModel.createColumnPost(article, toColumn);
    } catch (err) {
      console.log(err);
    }
  }
  let renderedComment;
  //如果发布的article不需要审核，并且不存在该文章的动态时就为该文章创建一条新的动态
  //不需要审核的文章状态不为默认状态
  // 如果不需要
  if(newComment.status === normalStatus) {
    try {
      //生成一条新动态
      MomentModel.createQuoteMomentAndPublish({
        ip,
        port,
        uid: this.uid,
        quoteType: commentQuoteType,
        quoteId: this._id,
      })
        .catch(console.error);
      await socket.sendCommentMessage(this._id);
      //通知作者文章被评论了
      this.noticeAuthorComment();
    } catch(err) {
      console.log(err);
    }
  } else {
    // 如果需要审核就将渲染好的内容返回
    const singleCommentData = await CommentModel.getSocketSingleCommentData(this._id);
    renderedComment = {
      articleId: article._id,
      commentId: this._id,
      ...singleCommentData
    };
  }
  return renderedComment;
}

/*
* 改变comment的status
* @param {String} status comment的状态
* */
schema.methods.changeStatus = async function(status) {
  const CommentModel = mongoose.model('comments');
  const commentStatus = await CommentModel.getCommentStatus();
  if(!commentStatus[status]) throwErr(400, "不存在该状态");
  await this.updateOne({
    $set: {
      status
    }
  });
}

/*
*
* 根据did来设置article的status
* */
schema.statics.setStatus = async function(did, status) {
  const CommentModel = mongoose.model('comments');
  const comment = await CommentModel.findOnly({did});
  await comment.updateOne({
    $set: {
      status,
    }
  });
}


/*
* 保存comment
* 将测试版变为历史版
* */
schema.methods.saveComment = async function () {
  const DocumentModel = mongoose.model('documents');
  const {comment: commentSource} = await DocumentModel.getDocumentSources();
  await DocumentModel.checkContentAndCopyBetaToHistoryBySource(commentSource, this._id);
}

/*
* 修改comment
* */
schema.methods.modifyComment = async function (props) {
  const DocumentModel = mongoose.model('documents');
  const {content, quoteDid} = props;
  const {did} = this;
  //通过id去更新document的内容
  await DocumentModel.updateDocumentByDid(did, {
    quoteDid,
    content,
  });
  // await this.updateOne({
  //   $set: {
  //     tlm,
  //   }
  // });
}
/*
* 拓展展示的comment评论数据
* @param {object} props
* props: {
*   comments {object} 需要拓展的评论
*   uid {string} 当前用户的uid
*   isModerator {boolean}
* }
* */
schema.statics.extendPostComments = async (props) => {
  const ReviewModel = mongoose.model('reviews');
  const {comments, uid, isModerator = '', permissions = {}, authorUid} = props;
  const DocumentModel = mongoose.model('documents');
  const UserModel = mongoose.model('users');
  const DelPostLogModel = mongoose.model('delPostLog');
  const SettingModel = mongoose.model('settings');
  const XsfsRecordModel = mongoose.model('xsfsRecords');
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const PostsVoteModel = mongoose.model('postsVotes');
  const creditScore = await SettingModel.getScoreByOperationType('creditScore');
  const {htmlToPlain} = require("../nkcModules/nkcRender");
  const CommentModel = mongoose.model('comments');
  const {getUrl} = require('../nkcModules/tools');
  const didArr = [];
  const uidArr = [];
  const quoteIdArr = [];
  const documentObj = {};
  const commentsId = [];
  const usersObj = {};
  const quoteObj = {};
  for(const c of comments) {
    didArr.push(c.did);
    uidArr.push(c.uid);
    commentsId.push(c._id);
  }
  const kcbsRecordsObj = {};
  const xsfsRecordsObj = {};
  const xsfsRecordTypes = await XsfsRecordModel.getXsfsRecordTypes();
  const xsfsRecords = await XsfsRecordModel.find({pid: {$in: commentsId}, canceled: false, type: xsfsRecordTypes.comment}).sort({toc: 1});
  const kcbsRecords = await KcbsRecordModel.find({commentId: {$in: commentsId}, type: 'creditKcb'}).sort({toc: 1});
  await KcbsRecordModel.hideSecretInfo(kcbsRecords);
  for(const r of kcbsRecords) {
    uidArr.push(r.from);
    r.to = "";
    if(!kcbsRecordsObj[r.commentId]) kcbsRecordsObj[r.commentId] = [];
    kcbsRecordsObj[r.commentId].push(r);
  }
  for(const r of xsfsRecords) {
    uidArr.push(r.operatorId);
    r.uid = "";
    if(!xsfsRecordsObj[r.pid]) xsfsRecordsObj[r.pid] = [];
    xsfsRecordsObj[r.pid].push(r);
  }
  const users = await UserModel.find({uid: {$in: uidArr}});
  for(const user of users) {
    usersObj[user.uid] = user;
  }
  const {comment: commentSource} = await DocumentModel.getDocumentSources();
  const {stable: stableType} = await DocumentModel.getDocumentTypes();
  const {normal: normalStatus, unknown: unknownStatus, disabled: disabledStatus, faulty: faultyStatus} = await DocumentModel.getDocumentStatus();
  const documents = await DocumentModel.find({did: {$in: didArr}, source: commentSource, type: stableType});
  for(const d of documents) {
    //用户是否具有审核权限
    if(!permissions.reviewed) {
      if(d.uid !== uid) {
        if((d.status !== normalStatus || d.type !== stableType) && !isModerator) continue;
      }
    }
    let delLog;
    let reason;
    //获取评论状态不正常的审核原因
    if(d.status === unknownStatus) {
      delLog = await ReviewModel.findOne({docId: d._id}).sort({toc: -1});
    } else if(d.status === disabledStatus) {
      delLog = await DelPostLogModel.findOne({postType: d.source, delType: disabledStatus, postId: d._id, delUserId: d.uid}).sort({toc: -1});
    } else if(d.status === faultyStatus) {
      delLog = await DelPostLogModel.findOne({postType: d.source, delType: faultyStatus, postId: d._id, delUserId: d.uid}).sort({toc: -1});
    }
    if(delLog) {
      reason = delLog.reason;
    }
    if(d.quoteDid) quoteIdArr.push(d.quoteDid);
    const {content, _id, type, status, addr} = d;
    documentObj[d.did] = {
      content,
      _id,
      type,
      status,
      addr,
      reason: reason?reason : '',
    };
  }
  //获取引用评论
  const quoteDocuments = await DocumentModel.find({_id: {$in: quoteIdArr}});
  for(const document of quoteDocuments) {
    const {uid, toc, content, _id, sid, did, tlm} = document;
    const comment = await CommentModel.findOne({did});
    const user = await UserModel.findOne({uid});
    const {username, avatar} = user;
    const commentInfo = await comment.getLocationUrl();
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
      commentUrl: commentInfo.url,
      username,
      avatar: getUrl('userAvatar', avatar),
      userHome: `/u/${user.uid}`
    };
  }
  for(const document of documents) {
    if(!document.quoteDid || !documentObj[document.did]) continue;
    documentObj[document.did].quote = quoteObj[document.quoteDid];
  }
  const _comments = [];
  for(const c of comments) {
    const user = usersObj[c.uid];
    const userGrade = await user.extendGrade();
    if(!documentObj[c.did]) continue;
    let credits = xsfsRecordsObj[c._id] || [];
    credits = credits.concat(...kcbsRecordsObj[c._id] || []);
    for(const r of credits) {
      if(r.from) {
        r.fromUser = usersObj[r.from];
        r.creditName = creditScore.name;
      } else {
        r.fromUser = usersObj[r.operatorId];
        r.type = 'xsf';
      }
    }
    const {xsf = [], kcb = []} = await XsfsRecordModel.extendCredits(credits);
    const m = c.toObject();
    const commentInfo = await c.getLocationUrl();
    const result = {
      ...m,
      content: await CommentModel.renderComment(documentObj[c.did]._id),
      docId: documentObj[c.did]._id,
      status: documentObj[c.did].status,
      type: documentObj[c.did].type,
      reason: documentObj[c.did]?documentObj[c.did].reason : null, //审核原因
      tlm: documentObj[c.did].tlm,
      addr: documentObj[c.did].addr,
      user: {
        uid: user.uid,
        username: user.username,
        avatar: getUrl('userAvatar', user.avatar),
        userHome: `/u/${user.uid}`,
        gradeId: userGrade._id,
        gradeName: userGrade.displayName,
      },
      xsf,
      kcb,
      articleId: commentInfo.articleId,
      commentUrl: commentInfo.url,
      isAuthor: authorUid === m.uid ? true : false,
      quote: documentObj[c.did].quote || null,
    };
    if(uid) {
      result.vote = await PostsVoteModel.getVoteByUid({uid, type: 'comment', id: c._id});
    } else {
      result.vote = null;
    }
    _comments.push(result);
  }
  return _comments;
}

/*
* 拓展实时显示的回复信息
* */
schema.statics.extendSingleComment = async (comment) => {
  const ReviewModel = mongoose.model('reviews');
  const DocumentModel = mongoose.model('documents');
  const UserModel = mongoose.model('users');
  const DelPostLogModel = mongoose.model('delPostLog');
  const {htmlToPlain} = require("../nkcModules/nkcRender");
  const CommentModel = mongoose.model('comments');
  const {getUrl} = require('../nkcModules/tools');
  const user = await UserModel.findOnly({uid: comment.uid});
  const {comment: commentSource} = await DocumentModel.getDocumentSources();
  const {stable: stableType} = await DocumentModel.getDocumentTypes();
  const {normal: normalStatus, unknown: unknownStatus, disabled: disabledStatus, faulty: faultyStatus} = await DocumentModel.getDocumentStatus();
  const commentInfo = await CommentModel.getCommentInfo(comment);
  const document = await DocumentModel.findOnly({did: comment.did, source: commentSource, type: stableType});
  let delLog;
  let reason;
  //获取评论状态不正常的审核原因
  if(document.status === unknownStatus) {
    delLog = await ReviewModel.findOne({docId: document._id}).sort({toc: -1});
  } else if(document.status === disabledStatus) {
    delLog = await DelPostLogModel.findOne({postType: document.source, delType: disabledStatus, postId: document._id, delUserId: document.uid}).sort({toc: -1});
  } else if(document.status === faultyStatus) {
    delLog = await DelPostLogModel.findOne({postType: document.source, delType: faultyStatus, postId: document._id, delUserId: document.uid}).sort({toc: -1});
  }
  if(delLog) {
    reason = delLog.reason;
  }
  let quoteDocument;
  if(document.quoteDid) {
    quoteDocument = await DocumentModel.findOne({_id: document.quoteDid});
    const {uid, toc, content, _id, sid, did, tlm} = quoteDocument;
    let quoteComment = await CommentModel.findOnly({did});
    const user = await UserModel.findOnly({uid});
    const {username, avatar} = user;
    quoteDocument = {
      cid: quoteComment._id,
      uid,
      toc,
      tlm,
      content: htmlToPlain(content, 100),
      docId: _id,
      sid,
      did,
      order: quoteComment.order,
      commentUrl: (await quoteComment.getLocationUrl()).url,
      username,
      avatar: getUrl('userAvatar', avatar),
      userHome: `/u/${user.uid}`
    };
  }
  const userGrade = await user.extendGrade();
  const m = comment.toObject()
  return {
    ...m,
    content: await CommentModel.renderComment(document._id),
    docId: document._id,
    status: document.status,
    type: document.type,
    reason,
    tlm: document.tlm,
    xsf: [],
    kcb: [],
    user: {
      uid: user.uid,
      username: user.username,
      avatar: getUrl('userAvatar', user.avatar),
      userHome: `/u/${user.uid}`,
      gradeId: userGrade._id,
      gradeName: userGrade.displayName,
    },
    commentUrl: (await comment.getLocationUrl()).url,
    isAuthor: commentInfo.isAuthor,
    quote: quoteDocument,
  };
};


/*
* 拓展审核comment信息
* */
schema.statics.extendReviewComments = async function(comments) {
  const CommentModel = mongoose.model('comments');
  const ColumnPostModel = mongoose.model('columnPosts');
  const DocumentModel = mongoose.model('documents');
  const ArticleModel = mongoose.model('articles');
  const ArticlePostModel = mongoose.model('articlePosts');
  const {comment: documentSource} = await DocumentModel.getDocumentSources();
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const commentsId = [];
  const articlePostSid = [];
  const articleId = [];
  const didArr = [];
  for(const comment of comments) {
    if(!comment) continue;
    commentsId.push(comment._id);
    articlePostSid.push(comment.sid);
  }
  //查找评论的引用
  const articlePosts = await ArticlePostModel.find({_id: {$in: articlePostSid}});
  const articlePostsObj = {};
  for(const articlePost of articlePosts) {
    articleId.push(articlePost.sid);
    articlePostsObj[articlePost._id] = articlePost;
  }
  const commentsObj = {};
  for(const comment of comments) {
    commentsObj[comment.sid] = comment;
  }
  //查找评论所属文章
  const articles = await ArticleModel.find({_id: {$in: articleId}});
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
  const  commentsDocumentObj = {};
  for(const d of commentDocuments) {
    const {type, sid} = d;
    if(!commentsDocumentObj[sid]) commentsDocumentObj[sid] = {};
    commentsDocumentObj[sid][type] = d;
  }
  const results = [];
  const {column: columnSource, zone: zoneSource} = await ArticlePostModel.getArticlePostSources();
  for(const comment of comments) {
    const {
      _id,
      toc,
      uid,
      sid
    } = comment;
    const commentObj = commentsDocumentObj[_id];
    const articlePost = articlePostsObj[sid];
    const articleDocumentObj = articlesDocumentObj[articlePost.sid];
    if(!commentObj || !articleDocumentObj) continue;
    const betaComment = commentObj.beta;
    const stableComment = commentObj.stable;
    const betaArticleDocument = articleDocumentObj.beta;
    const stableArticleDocument = articleDocumentObj.stable;
    if(!stableComment && !betaComment) continue;
    const document = stableComment || betaComment;
    const articleDocument = stableArticleDocument || betaArticleDocument;
    const {did} = document;
    const url = (await comment.getLocationUrl()).url;
    const result = {
      _id,
      uid,
      published: !!stableComment,
      hasBeta: !!betaComment,
      time: timeFormat(toc),
      did,
      url,
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
  const {htmlToPlain} = require("../nkcModules/nkcRender");
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
schema.methods.updateOrder = async function (order) {
  this.order = order;
  await this.updateOne({
    $set: {
      order: this.order
    }
  });
}


/*
* 根据articleId获取评论楼层
* */
schema.statics.getCommentOrder = async function(aid) {
  const CommentModel = mongoose.model('comments');
  const ArticlePostModel = mongoose.model('articlePosts');
  const articlePost = await ArticlePostModel.findOnly({sid: aid});
  const {default: defaultStatus} = await CommentModel.getCommentStatus();
  let order = 0;
  try{
    //获取当前文章下已经发表过的评论数量
    const count = await CommentModel.countDocuments({
      sid: articlePost._id,
      status: {
        $ne: defaultStatus,
      }
    });
    if(count !== 0) order = count;
  } catch(err) {
    throwErr(500, `moment order error`);
  }
  return order + 1;
}


/*
*拓展投诉的comments
* @para {Object} comments 需要拓展的评论
* */
schema.statics.extendComments = async function(comments) {
  const DocumentModel = mongoose.model('documents');
  const UserModel = mongoose.model('users');
  const ArticlePostModel = mongoose.model('articlePosts');
  const ArticleModel = mongoose.model('articles');
  const CommentModel = mongoose.model('comments');
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const didArr = [];
  const uidArr = [];
  const articlePostId = [];
  const articlesId = [];
  const documentObj = {};
  const userObj = {};
  const _comments = await CommentModel.getCommentsInfo(comments);
  for(const c of _comments) {
    didArr.push(c.did);
    uidArr.push(c.uid);
    articlePostId.push(c.sid);
  }
  const articlePosts = await ArticlePostModel.find({_id: {$in: articlePostId}});
  for(const articlePost of articlePosts) {
    articlesId.push(articlePost.sid);
  }
  let articles = await ArticleModel.find({_id: {$in: articlesId}});
  articles = await ArticleModel.getArticlesInfo(articles);
  const users = await UserModel.find({uid: {$in: uidArr}});
  for(const user of users) {
    userObj[user.uid] = user;
  }
  const documents = await DocumentModel.find({did: {$in: didArr}, type: 'stable'});
  for(const d of documents) {
    documentObj[d.did] = d;
  }
  const results = [];
  for(const c of _comments) {
    const {did, sid, _id, source, toc, uid, url} = c;
    const document = documentObj[did];
    const {content} = document;
    const result = {
      _id,
      did,
      sid,
      source,
      uid,
      url,
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
      atUsers: document.atUsers,
    },
    source: 'document',
    sid: _id
  });
  return c;
}

/*
* 拓展comment的document
* @param {object} comments 需要拓展的comment
* @param {string} type 需要拓展的document类型
* @param {[string]} options 需要拓展的document字段
* */
schema.statics.extendDocumentOfComment = async function(comments, type = 'beta', options) {
  const DocumentModel = mongoose.model('documents');
  const CommentModel = mongoose.model('comments');
  const arr = [];
  const obj = {};
  const _comments = [];
  const {deleted: deletedStatus} = await CommentModel.getCommentStatus();
  for(const c of comments) {
    if(c.status === deletedStatus) continue;
    arr.push(c.did);
  }
  const documentTypes = await DocumentModel.getDocumentTypes();
  const {comment: commentSource} = await DocumentModel.getDocumentSources();
  const documents = await DocumentModel.find({did: {$in: arr}, type: documentTypes[type], source: commentSource});
  for(const d of documents) {
    const a = {};
    for(const t of options) {
      a[t] = d[t];
    }
    obj[d.did] = a;
  }
  for(const c of comments) {
    const {_id, did, toc, status, sid, uid, source} = c;
    const document = obj[c.did];
    if(!document) continue;
    _comments.push({
      _id,
      did,
      toc,
      status,
      sid,
      uid,
      source,
      document,
    });
  }
  return _comments;
}

/*
* 通过文章引用去获取文章下的评论
* */
schema.statics.getCommentsByArticleId = async function(props) {
  const {paging = null, match} = props;
  const CommentModel = mongoose.model('comments');
  let comments;
  if(paging) {
    comments = await CommentModel.find({...match}).skip(paging.start).limit(paging.perpage);
  } else {
    comments = await CommentModel.find({...match}).sort({toc: -1}).limit(1);
  }
  return comments;
}

/*
* 获取单个评论的信息
* */
schema.statics.getCommentInfo = async (comment) => {
  const CommentModel = mongoose.model('comments');
  return (await CommentModel.getCommentsInfo([comment]))[0];
}

/*
* 通过comments获取评论所属文章链接以及评论信息
* @param {object} comments 需要拓展文章链接的评论comment
* */
schema.statics.getCommentsInfo = async function(comments) {
  const ArticleModel = mongoose.model('articles');
  const ArticlePostModel = mongoose.model('articlePosts');
  const ColumnPostModel = mongoose.model('columnPosts');
  const DocumentModel = mongoose.model('documents');
  const CommentModel = mongoose.model('comments');
  const UserModel = mongoose.model('users');
  const SettingModel = mongoose.model('settings');
  const XsfsRecordModel = mongoose.model('xsfsRecords');
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const creditScore = await SettingModel.getScoreByOperationType('creditScore');
  const commentsSid = [];
  const commentDid = [];
  const commentsId = [];
  const uidArr = [];
  for(const comment of comments) {
    commentsSid.push(comment.sid);
    commentDid.push(comment.did);
    commentsId.push(comment._id);
    uidArr.push(comment.uid);
  }
  const kcbsRecordsObj = {};
  const xsfsRecordsObj = {};
  const xsfsRecords = await XsfsRecordModel.find({pid: {$in: commentsId}, canceled: false, type: 'comment'}).sort({toc: 1});
  const kcbsRecords = await KcbsRecordModel.find({commentId: {$in: commentsId}, type: 'creditKcb'}).sort({toc: 1});
  await KcbsRecordModel.hideSecretInfo(kcbsRecords);
  for(const r of kcbsRecords) {
    uidArr.push(r.from);
    r.to = "";
    if(!kcbsRecordsObj[r.commentId]) kcbsRecordsObj[r.commentId] = [];
    kcbsRecordsObj[r.commentId].push(r);
  }
  for(const r of xsfsRecords) {
    uidArr.push(r.operatorId);
    r.uid = "";
    if(!xsfsRecordsObj[r.pid]) xsfsRecordsObj[r.pid] = [];
    xsfsRecordsObj[r.pid].push(r);
  }
  let users = await UserModel.find({uid: {$in: uidArr}});
  users = await UserModel.extendUsersInfo(users);
  const userObj = {};
  users.map(user => {
    userObj[user.uid] = user;
  })
  const _comments = await CommentModel.find({_id: {$in: commentsId}});
  const {stable: stableType} = await DocumentModel.getDocumentTypes();
  const {comment} = await DocumentModel.getDocumentSources();
  const documents = await DocumentModel.find({did: commentDid, type: stableType, source: comment});
  const commentDocumentsObj = {};
  for(const d of documents) {
    commentDocumentsObj[d.did] = d;
  }
  const articlePosts = await ArticlePostModel.find({_id: {$in: commentsSid}});
  const articlePostsSid = [];
  const articlePostsObj = {};
  for(const articlePost of articlePosts) {
    articlePostsSid.push(articlePost.sid);
    articlePostsObj[articlePost._id] = articlePost;
  }
  const articles = await ArticleModel.find({_id: {$in: articlePostsSid}});
  const articlesId = [];
  const articlesDid = [];
  const articleObj = {};
  for(const article of articles) {
    articlesDid.push(article.did);
    articlesId.push(article._id);
    articleObj[article._id] = article;
  }
  const articleDocumentObj = {};
  const articleDocuments = await DocumentModel.find({did: {$in: articlesDid}, type: stableType});
  for(const d of articleDocuments) {
    articleDocumentObj[d.sid] = d;
  }
  const columnPosts = await ColumnPostModel.find({pid: {$in: articlesId}});
  const columnPostsObj = {};
  for(const columnPost of columnPosts) {
    columnPostsObj[columnPost.pid] = columnPost;
  }
  const results = [];
  const {column: columnSource, zone: zoneSource} = await ArticlePostModel.getArticlePostSources();
  for(const comment of _comments) {
    const {sid, _id, source, did} = comment;
    const articlePost = articlePostsObj[sid];
    const commentDocument = commentDocumentsObj[did] || null;
    if(!articlePost) continue;
    const articleDocument = articleDocumentObj[articlePost.sid] || null;
    if(!articlePost) continue;
    const columnPost = columnPostsObj[articlePost.sid];
    if(articlePost.source === columnSource) {
      if(!columnPost) continue;
    }
    let url;
    if(articlePost.source === columnSource) {
      url = `/m/${columnPost.columnId}/a/${columnPost._id}`;
    } else if (articlePost.source === zoneSource){
      url =  `/zone/a/${articlePost.sid}`;
    }
    let credits = xsfsRecordsObj[_id] || [];
    credits = credits.concat(kcbsRecordsObj[_id] || []);
    for(const r of credits) {
      if(r.from) {
        r.fromUser = userObj[r.from];
        r.creditName = creditScore.name;
      } else {
        r.fromUser = userObj[r.operatorId];
        r.type = 'xsf';
      }
    }
    let page = Math.floor(comment.order/30);
    if(comment.order % 30 === 0) page = page -1;
    const commentUrl = `${url}?page=${page}&highlight=${comment._id}#highlight`;
    results.push({
      ...comment.toObject(),
      article: articleObj[articlePost.sid],
      commentDocument,
      articleDocument,
      user: userObj[comment.uid],
      url,
      isAuthor: commentDocument.uid === articleDocument.uid,
      commentUrl,
      credits,
    });
  }
  return results;
}

/*
* 指定动态ID，获取动态对象
* @param {[String]} momentsId
* @return {Object} 键为动态ID，值为动态对象
* */
schema.statics.getCommentsObjectByCommentsId = async function(commentsId) {
  const CommentModel = mongoose.model('comments');
  const comments = await CommentModel.find({_id: {$in: commentsId}});
  const commentsObj = {};
  for(const comment of comments) {
    commentsObj[comment._id] = comment;
  }
  return commentsObj;
}

/* -------------------------------------------------------暂定-------------------------------------------应当修改为通过comments去获取，而不需要再查询一遍
* 通过commentId获取comment
* @params {Array} commentId 需要获取的评论的Id
* */
schema.statics.getCommentsByCommentsId = async function (commentsId) {
  const CommentModel = mongoose.model('comments');
  const ArticleModel = mongoose.model('articles');
  const UserModel = mongoose.model('users');
  const ArticlePostModel = mongoose.model('articlePosts');
  const nkcRender = require('../nkcModules/nkcRender');
  const {getUrl, timeFormat} = require('../nkcModules/tools');
  //查找出评论
  let comments = await CommentModel.find({
    _id: {$in: commentsId},
  });
  //获取评论信息
  comments = await CommentModel.getCommentsInfo(comments);
  const usersId = [];
  const articlesId = [];
  const articlePostsId = [];
  for(const comment of comments) {
    usersId.push(comment.uid);
    articlePostsId.push(comment.sid);
  }
  //查找出独立文章评论盒子
  const articlePosts = await ArticlePostModel.find({_id: {$in: articlePostsId}});
  for(const a of articlePosts) {
    articlesId.push(a.sid);
  }
  const articles = await ArticleModel.find({_id: {$in: articlesId}});
  for(const article of articles) {
    usersId.push(article.uid);
  }
  //获取用户信息
  const userObj = await UserModel.getUsersObjectByUsersId(usersId);
  // console.log('comments', comments);
  const results = {};
  for(const comment of comments) {
    const {
      status,
      did,
      _id,
      commentDocument,
      articleDocument,
      url
    } = comment;
    const {content: commentContent, uid: commentUid} = commentDocument;
    const {content: articleContent, title, cover, uid: articleUid} = articleDocument;
    const articleUser = userObj[articleUid];
    const commentUser = userObj[commentUid];
    if(!articleUser || !commentUser) continue;
    results[comment._id] = {
      title: nkcRender.replaceLink(title),
      status,
      content: nkcRender.replaceLink(nkcRender.htmlToPlain(articleContent, 200)),
      coverUrl: cover? getUrl('postCover', cover): '',
      username: articleUser.username,
      uid: articleUid,
      avatarUrl: getUrl('userAvatar', articleUser.avatar),
      userHome: getUrl('userHome', articleUser.uid),
      time: timeFormat(articleDocument.toc),
      toc: articleDocument.toc,
      articleId: articleDocument._id,
      url,
      replyId: _id,
      replyToc: commentDocument.toc,
      replyTime: timeFormat(commentDocument.toc),
      replyUrl: comment.commentUrl,
      replyContent: nkcRender.replaceLink(nkcRender.htmlToPlain(commentContent, 200)),
      replyUsername: commentUser.username,
      replyUid: commentUid,
      replyAvatarUrl: getUrl('userAvatar', commentUser.avatar),
      replyUserHome: getUrl('userHome', commentUid)
    }
  }
  return results;
}

/*
* 通知文章作者文章被评论了,如果回复存在引用就通知被引用回复的作者回复被引用了
* */
schema.methods.noticeAuthorComment = async function() {
  const CommentModel = mongoose.model('comments');
  const MessageModel = mongoose.model('messages');
  const SettingModel = mongoose.model('settings');
  const DocumentModel = mongoose.model('documents');
  const socket = require('../nkcModules/socket');
  const commentInfo = await CommentModel.getCommentsInfo([this]);
  const {status, commentDocument, articleDocument} = commentInfo[0];
  const {normal: normalStatus} = await CommentModel.getCommentStatus();
  Promise.resolve()
    .then(async () => {
      //如果评论状态不正常或者评论的作者和文章作者为同一人时不需要通知
      if(status !== normalStatus) return;
      if(commentDocument.uid === articleDocument.uid) return;
      //去通知文章作者文章被回复
      // 在数据库中查找消息，是否已经通知过,如果已经通知过就直接返回
      const oldMessage = await MessageModel.find({
        r: articleDocument.uid,
        ty: "STU",
        'c.type': 'replyArticle',
        'c.docId': commentDocument._id,
      });
      if(oldMessage.length !== 0) return;
      //创建一条新的消息
      const message = MessageModel({
        _id: await SettingModel.operateSystemID("messages", 1),
        r: articleDocument.uid,
        ty: "STU",
        c: {
          type: 'replyArticle',
          docId: commentDocument._id,
          quoteDid: commentDocument.quoteDid,
        }
      });
      await message.save();
      //通过socket通知作者
      await socket.sendMessageToUser(message._id);
      return;
    })
    .then(async () => {
      //判断回复内容中是否存在引用，存在就去通知被引用回复的作者
      if(commentDocument.quoteDid) {
        //获取被引用回复的信息
        const quoteDocument = await DocumentModel.findOnly({_id: commentDocument.quoteDid});
        if (!quoteDocument) return console.log('未找到评论引用信息document');
        const quoteComment = await CommentModel.findOnly({_id: quoteDocument.sid});
        if (!quoteComment) return console.log('未找到评论引用信息comment');
        const quoteInfo = (await CommentModel.getCommentsInfo([quoteComment]))[0];
        if (!quoteInfo) return console.log('未找到评论引用信息');
        //查找数据库中是否已经由统治过改内容的消息，如果已经存在就不用通知作者
        const oldMessage = await MessageModel.find({
          r: quoteInfo.commentDocument.uid,
          ty: "STU",
          'c.type': 'replyComment',
          'c.docId': commentDocument._id,
        });
        if(oldMessage.length !== 0) return;
        //通知被引用作者
        const quoteMessage = MessageModel({
          _id: await SettingModel.operateSystemID("messages", 1),
          r: quoteInfo.commentDocument.uid,
          ty: "STU",
          c: {
            type: 'replyComment',
            docId: commentDocument._id,
            quoteDid: commentDocument.quoteDid,
          }
        });
        await quoteMessage.save();
        //通过socket通知作者
        return await socket.sendMessageToUser(quoteMessage._id);
      }
    })
    .catch(err => {
      console.log(err);
    })
}

/*
* 获取comment跳转定位地址
* */
schema.methods.getLocationUrl = async function() {
  const CommentModel = mongoose.model('comments');
  const comment = await CommentModel.getCommentInfo(this);
  if(!comment) return;
  return {
    url: comment.commentUrl,
    articleId: comment.article._id,
  };
}

/*
* 更新独立文章评论的点赞详情
* */
schema.methods.updateCommentsVote = async function() {
  const PostsVoteModel = mongoose.model('postsVotes');
  const {comment: commentSource} = await PostsVoteModel.getVoteSources();
  const votes = await PostsVoteModel.find({source: commentSource, sid: this._id});
  let upNum = 0;
  let downNum = 0;
  for(const vote of votes) {
    if(vote.type === 'up') {
      if(vote.sid === this._id) {
        upNum += vote.num;
      }
    } else {
      if(vote.sid === this._id) {
        downNum += vote.num;
      }
    }
  }
  this.voteUp = upNum;
  this.voteDown = downNum;
  const b = await this.updateOne({
    voteUp: upNum,
    voteDown: downNum,
  });
}


/*
* 获取新的 comment id
* @return {String}
* */
schema.statics.getNewId = async () => {
  const CommentModel = mongoose.model('comments');
  const redLock = require('../nkcModules/redLock');
  const getRedisKeys = require('../nkcModules/getRedisKeys');
  const {getRandomString} = require('../nkcModules/apiFunction');
  const key = getRedisKeys('newArticleId');
  let newId = '';
  let n = 10;
  const lock = await redLock.lock(key, 10000);
  try{
    while(true) {
      n -= 1;
      const _id = getRandomString('a0', 6);
      const comment = await CommentModel.findOne({
        _id
      }, {_id: 1});
      if(!comment) {
        newId = _id;
        break;
      }
      if(n === 0) {
        break
      }
    }
  }catch(err) {}
  await lock.unlock();
  if(!newId) {
    throwErr(500, 'comment id error');
  }
  return newId;
}

/*
* 获取待推送的回复
* */
schema.statics.getSocketCommentByPid = async function(cid) {
  const CommentModel = mongoose.model('comments');
  const tools = require('../nkcModules/tools');
  const nkcRender = require('../nkcModules/nkcRender');
  let comment = await CommentModel.findOnly({_id: cid});
  comment = await CommentModel.getCommentInfo(comment);
  return comment;
}

/*
* 渲染comment用于socket推送
* */
schema.statics.renderSingleCommentToHtml = async (cid) => {
  const render = require('../nkcModules/render');
  const UserModel = mongoose.model('users');
  const PATH = require('path');
  const CommentModel = mongoose.model('comments');
  let comment = await CommentModel.findOnly({_id: cid});
  let user = await UserModel.findOnly({uid: comment.uid});
  user = await UserModel.extendUserInfo(user);
  const commentData = await CommentModel.extendSingleComment(comment);
  const html = render(PATH.resolve(__dirname, '../pages/publicModules/commentCenter/singleComment/singleCommentPage.pug'), {commentData, user}, {}, {startTime: global.NKC.startTime});
  return html;
};

/*
* 获取单条comment动态渲染推送的数据
* */
schema.statics.getSocketSingleCommentData = async (cid) => {
  const CommentModel = mongoose.model('comments');
  const comment = await CommentModel.getSocketCommentByPid(cid);
  const html = await CommentModel.renderSingleCommentToHtml(cid);
  return {
    comment,
    html,
  };
};

/*
* 获取推送comment的事件名称
* */
schema.statics.getSocketEventName = async () => {
  return 'articleCommentMessage';
}


module.exports = mongoose.model('comments', schema);
