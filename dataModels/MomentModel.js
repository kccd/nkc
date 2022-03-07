const mongoose = require('../settings/database');

const momentStatus = {
  normal: 'normal',
  'default': 'default',
  deleted: 'deleted'
};

const momentQuoteTypes = {
  article: 'article',
  post: 'post',
  moment: 'moment',
};

const schema = new mongoose.Schema({
  _id: String,
  // 发表时间
  toc: {
    type: Date,
    default: Date.now,
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
    default: 0,
  },
  // 点踩
  voteDown: {
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
  const DocumentModel = mongoose.model('documents');
  const {moment: momentSource} = await DocumentModel.getDocumentSources();
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
    status: momentStatus.default,
    did: document.did,
    toc,
    files: resourcesId
  });
  await moment.save();
  return moment;
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
}

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
}

/*
* 通过发表人 ID 获取未发布的动态
* @param {String} uid 发表人 ID
* @return {moment schema or null}
* */
schema.statics.getUnPublishedMomentByUid = async (uid) => {
  const MomentModel = mongoose.model('moments');
  return MomentModel.findOne({
    uid,
    status: momentStatus.default,
  });
}

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
* 发布一条动态
* */
schema.methods.publish = async function() {
  const DocumentModel = mongoose.model('documents');
  const ResourceModel = mongoose.model('resources');
  const {moment: momentSource} = await DocumentModel.getDocumentSources();
  const betaDocument = await DocumentModel.getBetaDocumentBySource(momentSource, this._id);
  if(!betaDocument) throwErr(500, `动态数据错误 momentId=${this._id}`);
  const {checkString} = require('../nkcModules/checkData');
  checkString(betaDocument.content, {
    name: '动态内容',
    minLength: 1,
    maxLength: 1000
  });
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
  await DocumentModel.publishDocumentByDid(this.did);
  this.status = momentStatus.normal;
  await this.updateOne({
    $set: {
      status: this.status
    }
  });
};

/*
* 创建并发布一条引用类型的动态
* @param {String} uid 发表人 ID
* @param {String} quoteType 引用类型 momentQuoteType
* @param {String} quoteId 引用类型对应的 ID
* @return {moment schema}
* */
schema.statics.createQuoteMomentToPublish = async (uid, quoteType, quoteId) => {
  const MomentModel = mongoose.model('moments');
  await MomentModel.checkMomentQuoteType(quoteType);
  const momentId = await MomentModel.getNewId();
  const moment = MomentModel({
    _id: momentId,
    uid,
    quoteType,
    quoteId,
    status: momentStatus.normal,
  });
  await moment.save();
  return moment;
};

/*
* 拓展动态信息
* */
schema.statics.extendMomentsData = async (moments) => {
  const videoSize = require('../settings/video');
  const UserModel = mongoose.model('users');
  const ResourceModel = mongoose.model('resources');
  const DocumentModel = mongoose.model('documents');
  const PostModel = mongoose.model('posts');
  const MomentModel = mongoose.model('moments');
  const ArticleModel = mongoose.model('articles');
  const {getUrl, fromNow} = require('../nkcModules/tools');
  const {moment: momentSource} = await DocumentModel.getDocumentSources();
  const nkcRender = require('../nkcModules/nkcRender');
  const {filterMessageContent} = require("../nkcModules/xssFilters");
  const {twemoji} = require('../settings/editor');
  const usersId = [];
  const momentsId = [];
  let resourcesId = [];
  for(const moment of moments) {
    const {uid, files, _id} = moment;
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
  const results = [];
  for(const moment of moments) {
    const {
      uid,
      files,
      toc,
      _id,
      voteUp,
    } = moment;
    const user = usersObj[uid];
    if(!user) continue;
    const {username, avatar} = user;
    const betaDocument = stableDocumentsObj[_id];
    let content = '';
    if(betaDocument) {
      // 替换空格
      content = betaDocument.content.replace(/ /g, '&nbsp;');
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
        visitorAccess
      } = resource;
      let fileData;

      if(mediaType === 'mediaPicture') {
        const {
          height,
          width,
          name: filename
        } = defaultFile;
        fileData = {
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
          type: 'video',
          coverUrl: getUrl('resource', rid, 'cover'),
          visitorAccess,
          sources,
          filename,
          disabled,
          lost: !isFileExist,
        };
      }

      filesData.push(fileData);
    }
    results.push({
      uid,
      username,
      avatarUrl: getUrl('userAvatar', avatar),
      userHome: getUrl('userHome', uid),
      time: fromNow(toc),
      toc,
      content,
      voteUp,
      files: filesData
    });
  }
  return results;
};

module.exports = mongoose.model('moments', schema);
