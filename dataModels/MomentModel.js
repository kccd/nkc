const mongoose = require('../settings/database');
const {twemoji} = require("../settings/editor");

const momentStatus = {
  normal: 'normal',
  'default': 'default',
  deleted: 'deleted',
  disabled: 'disabled', //禁用
  faulty: 'faulty', //退修
  unknown: 'unknown',// 未审核
};

const momentQuoteTypes = {
  article: 'article',
  post: 'post',
  moment: 'moment',
};

const momentCommentPerPage = 10;

const schema = new mongoose.Schema({
  _id: String,
  // 创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 发表时间
  top: {
    type: Date,
    index: 1,
    default: null,
  },
  // 最后修改时间
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
  // 状态
  // normal: 正常的（已发布，未被删除）
  // default: 未发布的（正在编辑，待发布）
  // deleted: 被删除的（已发布，但被删除了）
  // disabled: 被禁用的（已发布但被管理员禁用了）
  // faulty: 被退修的 （已发布但被管理员退修了）
  // unknown: 状态位置的 （已发布未审核）
  status: {
    type: String,
    default: momentStatus.default,
    index: 1
  },
  // 当前动态内容所处的 document
  // 转发别人的动态时，若此字段为空字符创则表示完全转发而非引用转发
  did: {
    type: Number,
    default: null,
    index: 1
  },
  // 作为评论时此字段表示动态 ID，作为动态时此字段为空字符
  parent: {
    type: String,
    default: '',
    index: 1
  },
  // 作为评论时此字段表示层层上级 ID 组成的数组
  // 多级评论时可根据此字段查询引用树
  parents: {
    type: [String],
    default: [],
    index: 1
  },
  // 引用类型
  // moment
  // article
  quoteType: {
    type: String,
    default: '',
  },
  // 引用类型对应的 ID
  quoteId: {
    type: String,
    default: ''
  },
  // 附加的图片或视频
  // 作为动态时此字段存储
  files: {
    type: [String],
    default: [],
    index: 1
  },
  // 点赞
  voteUp: {
    type: Number,
    index: 1,
    default: 0,
  },
  // 点踩
  voteDown: {
    type: Number,
    default: 0
  },
  // 作为动态时表示回复数，作为评论时表示楼层
  order: {
    type: Number,
    default: 0
  }
});

/*
* 获取动态的状态列表
* */
schema.statics.getMomentStatus = async () => {
  return momentStatus;
};

/*
* 获取动态的引用类型
* */
schema.statics.getMomentQuoteTypes = async () => {
  return momentQuoteTypes;
};

/*
* 获取动态评论每页条数
* @return {Number}
* */
schema.statics.getMomentCommentPerPage = async () => {
  return momentCommentPerPage;
};

/*
* 检测引用类型是否合法
* */
schema.statics.checkMomentQuoteType = async (quoteType) => {
  const quoteTypes = Object.values(momentQuoteTypes);
  if(!quoteTypes.includes(quoteType)) {
    throwErr(500, `动态引用类型错误`);
  }
};

/*
* 获取新的动态 ID
* @return {String}
* */
schema.statics.getNewId = async () => {
  const MomentModel = mongoose.model('moments');
  const redLock = require('../nkcModules/redLock');
  const getRedisKeys = require('../nkcModules/getRedisKeys');
  const {getRandomString} = require('../nkcModules/apiFunction');
  const key = getRedisKeys('newMomentId');
  let newId = '';
  let n = 10;
  const lock = await redLock.lock(key, 10000);
  try{
    while(true) {
      n = n - 1;
      const _id = getRandomString('a0', 6);
      const moment = await MomentModel.findOne({
        _id
      }, {
        _id: 1
      });
      if(!moment) {
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
    throwErr(500, `moment id error`);
  }
  return newId;
};


/*
* 创建一条未发布的动态或评论
* 创建动态和评论时均会调用此函数
* @param {Object} props
*   @param {String} uid 发表人 ID
*   @param {String} content 动态内容
*   @param {[String]} resourcesId 资源 ID 组成的数组
*   @param {String} parent 评论时所评论的动态ID
* @return {moment schema}
* */
schema.statics.createMomentCore = async (props) => {
  const {
    uid,
    content = '',
    resourcesId = [],
    parent = '',
    quoteId = '',
    quoteType = '',
  } = props;
  const MomentModel = mongoose.model('moments');
  const DocumentModel = mongoose.model('documents');
  const {moment: momentSource} = await DocumentModel.getDocumentSources();
  const {checkString} = require('../nkcModules/checkData');
  checkString(content, {
    name: '评论内容',
    minLength: 0,
    maxLength: 100000
  });
  const toc = new Date();
  const momentId = await MomentModel.getNewId();
  const document = await DocumentModel.createBetaDocument({
    uid,
    content,
    toc,
    source: momentSource,
    sid: momentId,
  });
  const moment = MomentModel({
    _id: momentId,
    uid,
    parent,
    status: momentStatus.default,
    did: document.did,
    quoteId,
    quoteType,
    toc,
    files: resourcesId
  });
  await moment.save();
  return moment;
};

/*
* 创建一条未发布的动态
* 用户主动创作动态时，调用此函数生成动态
* @param {Object} props
*   @param {String} uid 发表人 ID
*   @param {String} content 动态内容
*   @param {[String]} resourcesId 资源 ID 组成的数组
* @return {moment schema}
* */
schema.statics.createMoment = async (props) => {
  const {uid, content, resourcesId} = props;
  const MomentModel = mongoose.model('moments');
  return await MomentModel.createMomentCore({
    uid,
    content,
    resourcesId
  });
};

/*
* 创建一条未发布的引用动态
* @param {Object} props
*   @param {String} uid 发表人ID
*   @param {String} content 动态内容
*   @param {[String]} resourcesId 资源ID
*   @param {String} quoteType 引用类型 getMomentQuoteTypes
*   @param {String} quoteId 引用类型对应的ID
* @return {moment schema}
* */
schema.statics.createQuoteMoment = async props => {
  const {uid, content, resourcesId, quoteId, quoteType} = props;
  const MomentModel = mongoose.model('moments');
  return await MomentModel.createMomentCore({
    uid,
    content,
    resourcesId,
    quoteId,
    quoteType
  });
};

/*
* 创建一条未发布的动态评论
* @param {Object} props
*   @param {String} uid 发表人 ID
*   @param {String} content 动态内容
*   @param {[String]} resourcesId 资源 ID 组成的数组
*   @param {String} parent 评论时所评论的动态ID
* @return {moment schema}
* */
schema.statics.createMomentComment = async (props) => {
  const MomentModel = mongoose.model('moments');
  const {uid, content, parent, resourcesId} = props;
  return await MomentModel.createMomentCore({
    uid,
    content,
    resourcesId,
    parent
  });
};

/*
* 修改动态内容
* @param {Object}
*   @param {String} content 动态内容
*   @param {[String]} resourcesId 资源 ID 组成的数组
* */
schema.methods.modifyMoment = async function(props) {
  const {content, resourcesId} = props;
  const DocumentModel = mongoose.model('documents');
  const time = new Date();
  await DocumentModel.updateDocumentByDid(this.did, {
    content,
    tlm: time,
  });
  await this.updateOne({
    $set: {
      files: resourcesId,
      tlm: time
    }
  });
};

/*
* 标记当前动态为已删除
* */
schema.methods.deleteMoment = async function() {
  this.status = momentStatus.deleted;
  await this.updateOne({
    $set: {
      status: this.status
    }
  });
};

/*
* 修改当前动态的status
* */
schema.methods.changeStatus = async function(status) {
  const MomentModel = mongoose.model('moments');
  const momentStatus = await MomentModel.getMomentStatus();
  if(!momentStatus[status]) throwErr(400, "不存在该状态");
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
  const MomentModel = mongoose.model('moments');
  const moment = await MomentModel.findOnly({did});
  await moment.updateOne({
    $set: {
      status,
    }
  });
}

/*
* 通过发表人ID和动态ID获取当前动态下未发布的评论
* @param {String} uid 发表人ID
* @param {String} mid 动态ID
* @return {moment schema or null}
* */
schema.statics.getUnPublishedMomentCommentById = async (uid, mid) => {
  const MomentModel = mongoose.model('moments');
  return MomentModel.findOne({
    uid,
    parent: mid,
    status: momentStatus.default
  });
};

/*
* 通过发表人ID和动态ID获取当前动态下未发布的评论
* @param {String} uid 发表人ID
* @param {String} mid 动态ID
* @return {Object or null}
*   @param {String} momentId 动态 ID
*   @param {Date} toc 动态创建时间
*   @param {Date} tlm 动态最后修改时间
*   @param {String} uid 发表人 ID
*   @param {String} content 动态内容 ID
* */
schema.statics.getUnPublishedMomentCommentDataById = async (uid, mid) => {
  const MomentModel = mongoose.model('moments');
  const moment = await MomentModel.getUnPublishedMomentCommentById(uid, mid);
  if(moment) {
    const DocumentModel = mongoose.model('documents');
    const {moment: momentSource} = await DocumentModel.getDocumentSources();
    const betaDocument = await DocumentModel.getBetaDocumentBySource(momentSource, moment._id);
    if(!betaDocument) {
      await moment.deleteMoment();
      return null;
    }
    return {
      momentCommentId: moment._id,
      momentId: moment.parent,
      toc: betaDocument.toc,
      tlm: betaDocument.tlm,
      uid: betaDocument.uid,
      content: betaDocument.content,
    }
  } else {
    return null;
  }
};

/*
* 通过发表人 ID 获取未发布的动态
* @param {String} uid 发表人 ID
* @return {moment schema or null}
* */
schema.statics.getUnPublishedMomentByUid = async (uid) => {
  const MomentModel = mongoose.model('moments');
  return MomentModel.findOne({
    uid,
    parent: '',
    status: momentStatus.default,
  });
};

/*
* 通过发表人 ID 获取未发布的动态数据
* @param {String} uid 发表人 ID
* @return {Object or null}
*   @param {String} momentId 动态 ID
*   @param {Date} toc 动态创建时间
*   @param {Date} tlm 动态最后修改时间
*   @param {String} uid 发表人 ID
*   @param {String} content 动态内容 ID
*   @param {[String]} picturesId 动态附带的图片 ID（resourceId）
*   @param {[String]} videosId 动态附带的视频 ID（resourceId）
* */
schema.statics.getUnPublishedMomentDataByUid = async (uid) => {
  const MomentModel = mongoose.model('moments');
  const ResourceModel = mongoose.model('resources');
  const moment = await MomentModel.getUnPublishedMomentByUid(uid);
  if(moment) {
    let picturesId = [];
    let videosId = [];
    const oldResourcesId = moment.files;
    if(oldResourcesId.length > 0) {
      const resources = await ResourceModel.find({rid: {$in: oldResourcesId}}, {
        rid: 1,
        mediaType: 1,
      });
      const resourcesId = resources.map(r => r.rid);
      if(resources.length > 0) {
        if (resources[0].mediaType === 'mediaPicture') {
          picturesId = resourcesId;
        } else {
          videosId = resourcesId;
        }
      }
    }
    const DocumentModel = mongoose.model('documents');
    const {moment: momentSource} = await DocumentModel.getDocumentSources();
    const betaDocument = await DocumentModel.getBetaDocumentBySource(momentSource, moment._id);
    if(!betaDocument) {
      await moment.deleteMoment();
      return null;
    }
    return {
      momentId: moment._id,
      toc: betaDocument.toc,
      tlm: betaDocument.tlm,
      uid: betaDocument.uid,
      content: betaDocument.content,
      picturesId,
      videosId,
    }
  } else {
    return null;
  }
};

/*
* 获取动态的编辑版 document
* @return {document schema}
* */
schema.methods.getBetaDocument = async function() {
  const DocumentModel = mongoose.model('documents');
  const {moment: momentSource} = await DocumentModel.getDocumentSources();
  return await DocumentModel.getBetaDocumentBySource(momentSource, this._id);
};

/*
* 检测当前动态或评论的内容
* */
schema.methods.checkBeforePublishing = async function() {
  const DocumentModel = mongoose.model('documents');
  const ResourceModel = mongoose.model('resources');
  const {moment: momentSource} = await DocumentModel.getDocumentSources();
  const betaDocument = await DocumentModel.getBetaDocumentBySource(momentSource, this._id);
  if(!betaDocument) throwErr(500, `动态数据错误 momentId=${this._id}`);
  if(!this.quoteType || !this.quoteId) {
    const {checkString} = require('../nkcModules/checkData');
    checkString(betaDocument.content, {
      name: '动态内容',
      minLength: 1,
      maxLength: 1000
    });
  }
  if(this.files.length > 0) {
    let mediaType;
    const resources = await ResourceModel.find({
      uid: this.uid,
      rid: {$in: this.files}
    }, {
      rid: 1,
      mediaType: 1
    });
    if(resources.length !== this.files.length) {
      throwErr(500, `媒体文件类型错误`);
    }
    for(const resource of resources) {
      if(!mediaType) {
        mediaType = resource.mediaType;
      } else {
        if(mediaType !== resource.mediaType) {
          throwErr(500, `媒体文件类型错误`);
        }
      }
    }
  }
};

/*
* 发布当前动态或评论
* */
schema.methods.publish = async function() {
  const DocumentModel = mongoose.model('documents');
  await this.checkBeforePublishing();
  const time = new Date();
  await DocumentModel.publishDocumentByDid(this.did);
  this.status = momentStatus.normal;
  await this.updateOne({
    $set: {
      top: time,
      status: this.status
    }
  });
};

/*
* 更新评论楼层和动态评论数
* */
schema.methods.updateMomentCommentOrder = async function() {
  const MomentModel = mongoose.model('moments');
  const redLock = require('../nkcModules/redLock');
  const getRedisKeys = require('../nkcModules/getRedisKeys');
  const {parent} = this;
  const key = getRedisKeys('momentOrder', parent);
  const lock = await redLock.lock(key, 6000);
  try{
    const moment = await MomentModel.findOnly({_id: parent});
    const order = moment.order + 1;
    await moment.updateOne({
      $set: {
        order,
      }
    });
    this.order = order;
    await this.updateOne({
      $set: {
        order: this.order,
      }
    });
    await lock.unlock();
  } catch(err) {
    await lock.unlock();
    throwErr(500, err.message);
  }
}

/*
* 发布一条评论
* 分为两种情况，发布评论、转发动态
* @param {String} postType 发表类型 comment(发表评论), repost(转发)
* @param {Boolean} alsoPost 是否触发附带操作，根据postType判断动作类型 comment(同时转发)、repost(同时评论)
* */
schema.methods.publishMomentComment = async function(postType, alsoPost) {
  if(!['comment', 'repost'].includes(postType)) {
    throwErr(500, `类型指定错误 postType=${postType}`);
  }
  const MomentModel = mongoose.model('moments');
  const {moment: quoteType} = momentQuoteTypes;
  const {_id, uid, resourcesId, parent} = this;
  const {content} = await this.getBetaDocument();

  if(postType === 'comment' || alsoPost) {
    // 需要创建评论
    await this.updateMomentCommentOrder();
    await this.publish();
  }
  if(postType === 'repost' || alsoPost) {
    // 需要转发动态
    await MomentModel.createQuoteMomentAndPublish({
      uid,
      content,
      resourcesId,
      quoteType,
      quoteId: parent,
    });
  }
};

/*
* 创建并发布一条引用类型的动态
* @param {Object}
  * @param {String} uid 发表人 ID
  * @param {String} quoteType 引用类型 momentQuoteType
  * @param {String} quoteId 引用类型对应的 ID
  * @param {String} content 动态内容(可为空)
  * @param {[String]} resourcesId 资源ID(可为空)
* @return {moment schema}
* */
schema.statics.createQuoteMomentAndPublish = async (props) => {
  const {uid, quoteType, quoteId, content, resourcesId = []} = props;
  const MomentModel = mongoose.model('moments');
  const moment = await MomentModel.createQuoteMoment({
    uid,
    resourcesId,
    quoteType,
    quoteId,
    content
  });
  await moment.publish();
  return moment;
};

/*
* 通过指定多个动态ID，获取多条动态
* @param {[String]} momentsId 动态ID组成的数组
* @param {String} type 指定返回的数据格式 array(数组), object(对象)
* @return {Object or [Object]}
*   当为对象时，键为mid，值为moment对象
*   当为数组时，数组值为moment对象
* */
schema.statics.getMomentsByMomentsId = async (momentsId, type = 'array') => {
  const MomentModel = mongoose.model('moments');
  const moments = await MomentModel.find({_id: {$in: momentsId}});
  const obj = {};
  for(const m of moments) {
    obj[m._id] = m;
  }
  if(type === 'array') {
    const arr = [];
    for(const mid of momentsId) {
      const moment = obj[mid];
      if(!moment) return;
      arr.push(moment);
    }
    return arr;
  }
  return obj;
};

/*
* 拓展引用数据，引用的数据包含 moment, article, thread 等
* @param {[String]} quotes 引用类型加引用ID组成的字符创 格式：`${quoteType}:${quoteId}`
* @param {String} uid 访问者 ID
* @return {Object} 键为 `${quoteType}:${quoteId}` 值为对象，对象属性如下：
*   当引用的为moment时，数据为 MomentModel.statics.extendMomentsData 返回的数据
*   当引用的为article时，数据为 ArticleModel.statics.getArticlesDataByArticlesId 返回的数据
* */
schema.statics.extendQuotesData = async (quotes, uid = '') => {
  const MomentModel = mongoose.model('moments');
  const ArticleModel = mongoose.model('articles');
  const quoteTypes = await MomentModel.getMomentQuoteTypes();
  const articlesId = [];
  const momentsId = [];
  for(const quote of quotes) {
    const [quoteType, quoteId] = quote.split(':');
    if(quoteType === quoteTypes.moment) momentsId.push(quoteId);
    if(quoteType === quoteTypes.article) articlesId.push(quoteId);
  }
  // 加载动态
  const moments = await MomentModel.getMomentsByMomentsId(momentsId);
  const momentsData = await MomentModel.extendMomentsData(moments, uid);
  // 加载文章
  const articlesData = await ArticleModel.getArticlesDataByArticlesId(articlesId);
  const results = {};
  for(const quote of quotes) {
    const [quoteType, quoteId] = quote.split(':');
    let result = null;
    if(quoteType === quoteTypes.moment) {
      result =  momentsData[quoteId];
    } else if(quoteType === quoteTypes.article) {
      result = articlesData[quoteId];
    }
    if(!result) continue;
    results[quote] = result;
  }
  return results;
};

/*
* 当动态引用了其他内容且当前动态不存在内容时，调用此函数生成默认的内容
* @param {String} quoteType 引用类型
* @return {String}
* */
schema.statics.getQuoteDefaultContent = async (quoteType) => {
  switch(quoteType) {
    case momentQuoteTypes.article: {
      return '我发表了新的文章~'
    }
    case momentQuoteTypes.moment: {
      return '我转发了动态~'
    }
  }
}

/*
* 渲染动态或评论内容
* @param {String} content 待渲染的内容
* @return {String} 渲染后的富文本内容
* */
schema.statics.renderContent = async (content) => {
  const nkcRender = require("../nkcModules/nkcRender");
  const {filterMessageContent} = require("../nkcModules/xssFilters");
  // 替换空格
  // content = content.replace(/ /g, '&nbsp;');
  // 处理链接
  content = nkcRender.URLifyHTML(content);
  // 过滤标签 仅保留标签 a['href']
  content = filterMessageContent(content);
  // 替换换行符
  content = content.replace(/\n/g, '<br/>');
  content = content.replace(/\[(.*?)]/g, function(r, v1) {
    if(!twemoji.includes(v1)) return r;
    return '<img class="message-emoji" src="/twemoji/2/svg/'+ v1 +'.svg"/>';
  });
  return content;
};

/*
* 获取动态显示所需要的基础数据
* @param {[schema moment]}
* @param {String} uid 访问者 ID
* @return {[Object]}
*   @param {String} momentId 动态ID
*   @param {String} uid 发表人ID
*   @param {String} username 发表人用户名
*   @param {String} avatarUrl 发表人头像链接
*   @param {String} userHome 发表人个人名片页
*   @param {String} time 格式化后的发表时间
*   @param {Date} toc 发表时间
*   @param {String} content 动态内容
*   @param {Number} voteUp 点赞数
*   @param {String} url 动态详情页链接
*   @param {[Object]} files 附带的资源
*     @param {String} rid 资源ID
*     @param {String} type 资源类型 video, picture
*     @param {String} filename 文件名
*     @param {Boolean} disabled 资源是否被屏蔽
*     @param {Boolean} lost 资源是否已丢失
*     图片特有
*     @param {Number} height 高度
*     @param {Number} width 宽度
*     视频特有
*     @param {String} coverUrl 视频封面（类型为图片时为空）
*     @param {Boolean} visitorAccess 游客是否有权限直接查看视频
*     @param {String} mask 视频遮罩内容
*     @param {[Object]} sources
*       @param {String} url 视频链接
*       @param {String} height 视频分辨率 480p、720p、1080p
*       @param {Number} dataSize 视频大小
* */
schema.statics.extendMomentsData = async (moments, uid = '') => {
  const videoSize = require('../settings/video');
  const UserModel = mongoose.model('users');
  const ResourceModel = mongoose.model('resources');
  const MomentModel = mongoose.model('moments');
  const DocumentModel = mongoose.model('documents');
  const PostsVoteModel = mongoose.model('postsVotes');
  const {getUrl, fromNow} = require('../nkcModules/tools');
  const {moment: momentSource} = await DocumentModel.getDocumentSources();
  const usersId = [];
  const momentsId = [];
  let resourcesId = [];
  for(const moment of moments) {
    const {
      uid,
      files,
      _id,
    } = moment;
    usersId.push(uid);
    resourcesId = resourcesId.concat(files);
    momentsId.push(_id);
  }
  // 准备用户数据
  const usersObj = await UserModel.getUsersObjectByUsersId(usersId);
  // 准备附件数据
  const resourcesObj = await ResourceModel.getResourcesObjectByResourcesId(resourcesId);
  // 准备动态内容
  const stableDocumentsObj = await DocumentModel.getStableDocumentsBySource(momentSource, momentsId, 'object');
  // 点赞内容
  const {moment: momentVoteSource} = await PostsVoteModel.getVoteSources();

  const votesType = await PostsVoteModel.getVotesTypeBySource(
    momentVoteSource,
    momentsId,
    uid
  );

  const results = {};
  for(const moment of moments) {
    const {
      uid,
      files,
      toc,
      _id,
      voteUp,
      order,
      quoteType,
    } = moment;
    const user = usersObj[uid];
    if(!user) continue;
    const {username, avatar} = user;
    const betaDocument = stableDocumentsObj[_id];
    let content = '';
    if(betaDocument) {
      content = await MomentModel.renderContent(betaDocument.content);
    }

    if(!content && quoteType) {
      content = await MomentModel.getQuoteDefaultContent(quoteType);
    }

    const filesData = [];
    for(const rid of files) {
      const resource = resourcesObj[rid];
      if(!resource) continue;
      await resource.setFileExist();
      const {
        mediaType,
        defaultFile,
        disabled,
        isFileExist,
        visitorAccess,
        mask,
      } = resource;
      let fileData;

      if(mediaType === 'mediaPicture') {
        const {
          height,
          width,
          name: filename
        } = defaultFile;
        fileData = {
          rid,
          type: 'picture',
          url: getUrl('resource', rid),
          height,
          width,
          filename,
          disabled,
          lost: !isFileExist,
        };
      } else {
        const {name: filename} = defaultFile;
        const sources = [];
        for(const {size, dataSize} of resource.videoSize) {
          const {height} = videoSize[size];
          const url = getUrl('resource', rid, size) + '&w=' + resource.token;
          sources.push({
            url,
            height,
            dataSize,
          });
        }
        fileData = {
          rid: rid,
          type: 'video',
          coverUrl: getUrl('resource', rid, 'cover'),
          visitorAccess,
          mask,
          sources,
          filename,
          disabled,
          lost: !isFileExist,
        };
      }

      filesData.push(fileData);
    }
    results[_id] = {
      momentId: _id,
      uid,
      username,
      avatarUrl: getUrl('userAvatar', avatar),
      userHome: getUrl('userHome', uid),
      time: fromNow(toc),
      toc,
      content,
      voteUp,
      voteType: votesType[_id],
      commentCount: order,
      files: filesData,
      url: getUrl('zoneMoment', _id),
    };
  }
  return results;
};

/*
* 拓展动态信息
* 考虑黑名单
* @param {[schema moment]}
* @param {String} uid 访问者 ID
* @return {[Object]}
*   @param {String} momentId 动态ID
*   @param {String} uid 发表人ID
*   @param {String} username 发表人用户名
*   @param {String} avatarUrl 发表人头像链接
*   @param {String} userHome 发表人个人名片页
*   @param {String} time 格式化后的发表时间
*   @param {Date} toc 发表时间
*   @param {String} content 动态内容
*   @param {Number} voteUp 点赞数
*   @param {[Object]} files 附带的资源
*     @param {String} rid 资源ID
*     @param {String} type 资源类型 video, picture
*     @param {String} filename 文件名
*     @param {Boolean} disabled 资源是否被屏蔽
*     @param {Boolean} lost 资源是否已丢失
*     图片特有
*     @param {Number} height 高度
*     @param {Number} width 宽度
*     视频特有
*     @param {String} coverUrl 视频封面（类型为图片时为空）
*     @param {Boolean} visitorAccess 游客是否有权限直接查看视频
*     @param {String} mask 视频遮罩内容
*     @param {[Object]} sources
*       @param {String} url 视频链接
*       @param {String} height 视频分辨率 480p、720p、1080p
*       @param {Number} dataSize 视频大小
*   @param {Object} quoteData
*     @param {String} quoteType 引用类型
*     @param {String} quoteId 引用ID
*     @param {Object} data
*       当引用的为moment时，数据为 schema.statics.extendMomentsData 返回的数据
* */
schema.statics.extendMomentsListData = async (moments, uid = '') => {
  const MomentModel = mongoose.model('moments');
  const momentsData = await MomentModel.extendMomentsData(moments, uid);
  const quotesId = [];
  for(const moment of moments) {
    const {quoteId, quoteType} = moment;
     if(quoteType && quoteId) {
       quotesId.push(`${quoteType}:${quoteId}`);
     }
  }
  const quotesData = await MomentModel.extendQuotesData(quotesId);
  const results = [];
  for(const moment of moments) {
    const {quoteType, quoteId, _id} = moment;
    const momentData = momentsData[_id];
    let quoteData = null;
    if(quoteType || quoteId) {
      quoteData = {
        quoteType,
        quoteId,
        data: quotesData[`${quoteType}:${quoteId}`]
      }
    }
    momentData.quoteData = quoteData;
    results.push(momentData);
  }
  return results;
};

/*
* @param {[schema moment]} comments 动态评论对象组成的数组
* @param {String} uid 访问者
* @return {[Object]}
*   @param {String} momentId 评论所在动态ID
*   @param {String} momentCommentId 评论ID
*   @param {String} uid 作者ID
*   @param {String} username 作者名称
*   @param {String} avatarUrl 作者头像链接
*   @param {String} userHome 作者主页链接
*   @param {String} time 格式化后的发表时间
*   @param {Date} toc 发表时间
*   @param {Number} order 评论所在楼层
*   @param {Number} voteUp 评论点赞数
*   @param {String} content 评论内容，富文本
* */
schema.statics.extendCommentsData = async function (comments, uid) {
  const DocumentModel = mongoose.model('documents');
  const MomentModel = mongoose.model('moments');
  const UserModel = mongoose.model('users');
  const PostsVoteModel = mongoose.model('postsVotes');
  const {getUrl, timeFormat} = require('../nkcModules/tools');
  const usersId = [];
  const commentsId = [];
  for(const comment of comments) {
    const {uid, _id} = comment;
    usersId.push(uid);
    commentsId.push(_id);
  }
  const usersObj = await UserModel.getUsersObjectByUsersId(usersId);
  const {moment: momentSource} = await DocumentModel.getDocumentSources();
  const stableDocuments = await DocumentModel.getStableDocumentsBySource(momentSource, commentsId, 'object');
  const {moment: momentVoteSource} = await PostsVoteModel.getVoteSources();
  const votesType = await PostsVoteModel.getVotesTypeBySource(
    momentVoteSource,
    commentsId,
    uid
  );
  const commentsData = [];
  for(const comment of comments) {
    const {
      uid,
      _id,
      order,
      toc,
      parent,
      voteUp,
    } = comment;
    const user = usersObj[uid];
    if(!user) continue;
    const stableDocument = stableDocuments[_id];
    if(!stableDocument) continue;
    commentsData.push({
      momentId: parent,
      momentCommentId: _id,
      uid: user.uid,
      order,
      voteUp,
      voteType: votesType[_id],
      content: await MomentModel.renderContent(stableDocument.content),
      username: user.username,
      avatarUrl: getUrl('userAvatar', user.avatar),
      userHome: getUrl('userHome', user.uid),
      time: timeFormat(toc),
      toc: toc,
    });
  }
  return commentsData;
}

/*
* 获取评论所在页数
* @param {Number} order 楼层
* @return {Number}
* */
schema.statics.getPageByOrder = async (order) => {
  return Math.ceil(order / momentCommentPerPage) - 1;
}

/*
* 点赞或点踩
* @param {String} voteType up(点赞) down(点踩)
* @param {String} uid 点赞或点踩用户ID
* @return {Object} 最新点赞点踩数
*   @param {Number} voteUp 点赞数
*   @param {Number} voteDown 点踩数
* */
schema.methods.vote = async function(voteType, uid, cancel = false) {
  const PostsVoteModel = mongoose.model('postsVotes');
  const {moment: momentSource} = await PostsVoteModel.getVoteSources();
  const func = cancel? PostsVoteModel.cancelVote: PostsVoteModel.addVote;
  await func({
    source: momentSource,
    sid: this._id,
    uid,
    voteType,
    tUid: this.uid,
  });
  const {voteUp, voteDown} = await this.syncVoteCount();
  return {
    voteUp,
    voteDown
  };
};

/*
* 同步动态或动态评论的点赞点踩数
* @return {Object} 最新点赞点踩数
*   @param {Number} voteUp 点赞数
*   @param {Number} voteDown 点踩数
* */
schema.methods.syncVoteCount = async function() {
  const PostsVoteModel = mongoose.model('postsVotes');
  const {_id} = this;
  const {moment: momentSource} = await PostsVoteModel.getVoteSources();
  const voteTypes = await PostsVoteModel.getVoteTypes();

  const voteUp = await PostsVoteModel.getTotalVote(momentSource, _id, voteTypes.up);
  const voteDown = await PostsVoteModel.getTotalVote(momentSource, _id, voteTypes.down);

  this.voteUp = voteUp;
  this.voteDown = voteDown;

  await this.updateOne({
    $set: {
      voteUp: this.voteUp,
      voteDown: this.voteDown
    }
  });

  return {
    voteUp: this.voteUp,
    voteDown: this.voteDown,
  }
};

module.exports = mongoose.model('moments', schema);
