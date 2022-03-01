const mongoose = require('../settings/database');

const momentStatus = {
  normal: 'normal',
  'default': 'default',
  deleted: 'deleted'
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
    required: true,
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
  }
});

schema.statics.getMomentStatus = async () => {
  return momentStatus;
};

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

schema.statics.getUnPublishedMomentByUid = async (uid) => {
  const MomentModel = mongoose.model('moments');
  return MomentModel.findOne({
    uid,
    status: momentStatus.default,
  });
}

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

schema.methods.getBetaDocument = async function() {
  const DocumentModel = mongoose.model('documents');
  const {moment: momentSource} = await DocumentModel.getDocumentSources();
  return await DocumentModel.getBetaDocumentBySource(momentSource, this._id);
};

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
  this.status = momentStatus.normal;
  await this.updateOne({
    $set: {
      status: this.status
    }
  });
};

module.exports = mongoose.model('moments', schema);
