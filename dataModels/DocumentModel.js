const mongoose = require('../settings/database');
const cheerio = require('cheerio');
const schema = new mongoose.Schema({
  // 当前文档的 ID，唯一
  _id: Number,
  // 展示层记录的文档 ID，同一文档的不同版本（正式版、编辑版、历史版）此字段值相同
  did: {
    type: Number,
    required: true,
    index: 1
  },
  // 版本类型 stable, beta, history
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 文档的创建人
  uid: {
    type: String,
    default: '',
    index: 1
  },
  // 同 did 文档的最原始的创建时间
  dt: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 文档的创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 最后修改时间
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  // 封面
  cover: {
    type: String,
    default: ''
  },
  // 文档标题
  title: {
    type: String,
    default: ''
  },
  // 文档内容
  content: {
    type: String,
    default: ''
  },
  // 文档关键词 英文
  keywordsEN: {
    type: [String],
    default: []
  },
  // 文档关键词 中文
  keywords: {
    type: [String],
    default: []
  },
  // 文档摘要 英文
  abstractEN: {
    type: String,
    default: ''
  },
  // 文档摘要 中文
  abstract: {
    type: String,
    default: ''
  },
  // 是否通过审核
  reviewed: {
    type: Boolean,
    default: false,
  },
  // 文档内容字数 排除了 html 标签
  wordCount: {
    type: Number,
    default: 0
  },
  chapters:{
    type:[
      {
        name:String,
        content:String,
        creationTime:{
          default:Date.now,
          type:Date
        },
        lastModification:{
          default:Date.now,
          type:Date
        }
      }
    ],
    default:[]
  },
  // 已经发送过 AT 消息的用户
  atUsers: {
    type: [
      {
        username: String,
        uid: String,
      }
    ],
    default: []
  },
  // 引用来源（文档所在的系统）
  // comment, article, post
  source: {
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
  // 发表当前文档时的 IP
  ip: {
    type: String,
    default: '',
  },
  // IP 所对应的端口
  port: {
    type: String,
    default: ''
  }
  // 已发送过@通知的用户
}, {
  collection: 'documents'
});

/*
* 获取文档内容 ID
* @return {String}
* */
schema.statics.getId = async () => {
  const SettingModel = mongoose.model('settings');
  return await SettingModel.operateSystemID('documentsInner', 1);
};

/*
* 获取文档被引用 ID
* @return {String}
* */
schema.statics.getDid = async () => {
  const SettingModel = mongoose.model('settings');
  return await SettingModel.operateSystemID('documents', 1);
};

/*
* 获取文档合法的来源类型
* @return {Object}
* */
schema.statics.getDocumentSources = async () => {
  return {
    comment: 'comment',
    article: 'article',
    post: 'post'
  }
};

/*
* 检测文档来源是否有效
* @param {String} source 文档来源
* */
schema.statics.checkDocumentSource = async (source) => {
  const DocumentModel = mongoose.model('documents');
  const documentSources = await DocumentModel.getDocumentSources();
  const sourceNames = Object.values(documentSources);
  if(!sourceNames.includes(source)) throwErr(500, `document source error. source=${source}`);
};

/*
* 创建文档
* */
schema.statics.createBetaDocument = async (props) => {
  const {
    title = '',
    content = '',
    cover = '',
    coverFile = '',
    keywords = [],
    keywordsEN = [],
    abstract = '',
    abstractEN = '',
    uid,
    toc,
    source,
    sid,
  } = props;
  const DocumentModel = mongoose.model('documents');
  const AttachmentModel = mongoose.model('attachments');
  const {getHTMLTextLength} = require('../nkcModules/checkData');
  await DocumentModel.checkDocumentSource(source);
  const wordCount = getHTMLTextLength(content);
  const _id = await DocumentModel.getId();
  const did = await DocumentModel.getDid();
  const document = DocumentModel({
    _id,
    did,
    uid,
    title,
    content,
    wordCount,
    cover,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    toc,
    dt: toc,
    type: 'beta',
    source,
    sid,
  });
  await document.save();
  await document.updateResourceReferences();
  if(coverFile) {
    await AttachmentModel.saveDocumentCover(document._id, coverFile);
  }
  return document;
};

/*
* 复制开发版内容生成历史版
* */
schema.methods.copyToHistoryDocument = async function() {
  const DocumentModel = mongoose.model('documents');
  const originDocument = this.toObject();
  delete originDocument._v;
  originDocument.type = 'history';
  originDocument._id = await DocumentModel.getId();
  originDocument.toc = new Date();
  const document = DocumentModel(originDocument);
  await document.save();
  return document;
};
schema.statics.copyBetaToHistoryBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  const betaDocument = await DocumentModel.getBetaDocumentBySource(source, sid);
  if(!betaDocument) throwErr(400, `不存在编辑版，无法保存历史`);
  await betaDocument.copyToHistoryDocument();
};
/*
* 将正式版变为开发板
* */
schema.methods.setAsHistoryDocument = async function() {
  await this.updateOne({
    $set: {
      type: 'history'
    }
  });
};
/*
* 复制正式版内容生成编辑版
* */
schema.statics.createBetaDocumentByStableDocument = async function(did) {
  const DocumentModel = mongoose.model('documents');
  const stableDocument = await DocumentModel.findOne({did, type: 'stable'});
  if(!stableDocument) throwErr(500, `文档 ${did} 不存在正式版，无法生成编辑版`);
  const originDocument = stableDocument.toObject();
  delete originDocument._v;
  originDocument.type = 'beta';
  originDocument._id = await DocumentModel.getId();
  originDocument.toc = new Date();
  const betaDocument = DocumentModel(originDocument);
  await betaDocument.save();
  return betaDocument;
};

/*
* 将开发版更新为正式版，将正式版更新为历史版
* */
schema.statics.publishDocumentByDid = async (did) => {
  const DocumentModel = mongoose.model('documents');
  const type = ['stable', 'beta'];
  const documentsObj = {};
  const documents = await DocumentModel.find({
    did,
    type: {$in: type}
  });
  for(const d of documents) {
    documentsObj[d.type] = d;
  }
  if(!documentsObj.beta) throwErr(400, `不存在编辑版，无需发表`);
  if(documentsObj.stable) await documentsObj.stable.setAsHistoryDocument();
  await documentsObj.beta.updateOne({
    $set: {
      type: type[0]
    }
  });
};

/*
* 指定 did 更新文档内容
* 如果没有编辑版则复制正式版内容生成编辑版，然后再更新编辑版内容
* */
schema.statics.updateDocumentByDid = async (did, props) => {
  const {
    title,
    content,
    cover,
    coverFile,
    abstract,
    abstractEN,
    keywords,
    keywordsEN,
    tlm,
  } = props;
  const AttachmentModel = mongoose.model('attachments');
  const DocumentModel = mongoose.model('documents');
  const {getHTMLTextLength} = require('../nkcModules/checkData');
  const wordCount = getHTMLTextLength(content);
  let betaDocument = await DocumentModel.findOne({
    did,
    type: 'beta'
  });
  if(!betaDocument) {
    betaDocument = await DocumentModel.createBetaDocumentByStableDocument(did);
  }
  await betaDocument.updateOne({
    $set: {
      title,
      content,
      cover,
      abstract,
      abstractEN,
      keywords,
      keywordsEN,
      wordCount,
      tlm
    }
  });
  const _betaDocument = await DocumentModel.findOnly({_id: betaDocument._id});
  await _betaDocument.updateResourceReferences();
  if(coverFile) {
    await AttachmentModel.saveDocumentCover(betaDocument._id, coverFile);
  }
};

/*
* 获取正式版文档内容
* */
schema.statics.getStableDocumentBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  await DocumentModel.checkDocumentSource(source);
  return DocumentModel.findOne({
    type: 'stable',
    source,
    sid
  });
};

schema.statics.getBetaDocumentBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  await DocumentModel.checkDocumentSource(source);
  return DocumentModel.findOne({
    type: 'beta',
    source,
    sid,
  });
};

schema.statics.getStableDocumentContentBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  let stableDocument = await DocumentModel.getStableDocumentBySource(source, sid);
  if(!stableDocument) {
    stableDocument = await DocumentModel.getBetaDocumentBySource(source, sid);
    stableDocument.title = '';
    stableDocument.content = '';
    stableDocument.abstract = '';
    stableDocument.abstractEN = '';
    stableDocument.keywords = [];
    stableDocument.keywordsEN = [];
    stableDocument.cover = '';
  }
  return stableDocument;
}

schema.statics.getBetaDocumentContentBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  let betaDocument = await DocumentModel.getBetaDocumentBySource(source, sid);
  if(!betaDocument) {
    betaDocument = await DocumentModel.getStableDocumentBySource(source, sid);
  }
  return betaDocument;
};

schema.statics.getStableDocumentRenderingContent = async (source, sid, uid) => {
  const DocumentModel = mongoose.model('documents');
  const stableDocument = await DocumentModel.getStableDocumentContentBySource(source, sid);
  return stableDocument.getRenderingData(uid);
};
schema.methods.getRenderingData = async function(uid) {
  const {timeFormat, fromNow, getUrl} = require('../nkcModules/tools');
  const nkcRender = require('../nkcModules/nkcRender');
  const ResourceModel = mongoose.model('resources');
  const UserModel = mongoose.model('users');
  let user;
  if(uid) {
    user = await UserModel.findOnly({uid});
  }
  const resourceReferenceId = await this.getResourceReferenceId();
  const resources = await ResourceModel.getResourcesByReference(resourceReferenceId);
  const content = nkcRender.renderHTML({
    type: "article",
    post: {
      c: this.content,
      resources,
      user
    },
  });
  return {
    time: timeFormat(this.toc),
    coverUrl: this.cover? getUrl('documentCover', this.cover): '',
    mTime: this.tlm? fromNow(this.tlm): null,
    title: this.title || '未填写标题',
    content
  }
}

schema.statics.getDocumentsObjById = async (documentsId) => {
  const DocumentModel = mongoose.model('documents');
  const documents = await DocumentModel.find({
    _id: {$in: documentsId}
  });
  const obj = {};
  for(let i = 0; i < documents.length; i++) {
    const document = documents[i];
    obj[document._id] = document;
  }
  return obj;
};


schema.methods.extendData = async function(uid) {
  const {timeFormat, fromNow, getUrl} = require('../nkcModules/tools');
  const nkcRender = require('../nkcModules/nkcRender');
  const ResourceModel = mongoose.model('resources');
  const UserModel = mongoose.model('users');
  let user;
  if(uid) {
    user = await UserModel.findOnly({uid});
  }
  const resourceReferenceId = await this.getResourceReferenceId();
  const resources = await ResourceModel.getResourcesByReference(resourceReferenceId);
  const content = await nkcRender.renderHTML({
    type: "article",
    post: {
      c: this.content,
      resources,
      user
    },
  });
  return {
    time: timeFormat(this.toc),
    coverUrl: this.cover? getUrl('documentCover', this.cover): '',
    mTime: this.tlm? fromNow(this.tlm): null,
    title: this.title || '未填写标题',
    content
  }
};

/*
* 获取 document 在 resource 中的引用 ID
* @return {String}
* */
schema.methods.getResourceReferenceId = async function() {
  return `document_${this.did}`;
}

/*
* 解析 document 内容（c 字段）中的 resource 引用
* 将当前 document ID 记录到 resource references 上
* */
schema.methods.updateResourceReferences = async function () {
  const id = await this.getResourceReferenceId();
  const ResourceModel = mongoose.model('resources');
  await ResourceModel.toReferenceSource(id, this.content);
}

/*
* 解析 AT 用户信息
* @return {[Object]}
*   @param {String} uid 用户ID
*   @param {String} username 用户名
* */
schema.methods.getAtUsers = async function() {
  const {content = ''} = this;
  const atUsers = [];
  const atUsersId = [];
  const $ = cheerio.load(content);
  const html = $('body')[0];
  const texts = [];
  const getNodesText = function(node) {
    if(!node.children || node.children.length === 0) return;
    for(let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      if(c.type === 'text') {
        if(c.data.length > 0) texts.push(c.data);
      } else if(c.type === 'tag') {
        if(['a', 'blockquote', 'code', 'pre'].includes(c.name)) continue;
        if(c.attribs['data-tag'] === 'nkcsource') continue;
        getNodesText(c);
      }
    }
  }
  // 获取文本内容，已排除掉特殊 dom 中的文本
  getNodesText(html);

  for(let text of texts) {
    // 排除不包含@的内容
    if(!text.includes('@')) continue;
    text = text.toLowerCase();
    // 获取当前文本中@之后的文本
    const arr = text.split('@');
    // 去掉第@之前的文本
    arr.shift();
    for(let item of arr) {
      // 最多取@之后的30个字来判断是否为用户名
      item = item.slice(0, 30);
      // 去掉空格后边的字符
      item = item.split(' ')[0];
      // 排除空字符
      if(item.length === 0) continue;
      // 去数据库查询用户名是否存在
      const usernames = [];
      const textLength = item.length;
      for(let i = 1; i <= textLength; i++) {
        usernames.push(item.slice(0, i));
      }
      const targetUsers = await UserModel.find({usernameLowerCase: {$in: usernames}}, {username: 1, usernameLowerCase: 1, uid: 1});
      let user = null;
      // 取用户名最长的用户为目标用户
      for(const u of targetUsers) {
        if(user === undefined || user.username.length < u.username.length) {
          user = u;
        }
      }
      if(!user) continue;
      if(atUsersId.includes(user.uid)) continue;
      atUsersId.push(user.uid);
      atUsers.push({
        uid: user.uid,
        username: user.username
      });
    }
  }
  return atUsers;
};

/*
* 发送 AT 消息，并且将接收 AT 消息的用户的信息（uid, username）记录到 document 上
* @param {String} from 当前文本来自哪里
* */
schema.methods.sendMessageToAtUsers = async function(from) {
  if(!['post', 'article'].includes(from)) throwErr(500, `document from error`);
  const socket = require('../nkcModules/socket');
  const MessageModel = mongoose.model('messages');
  const SettingModel = mongoose.model('settings');
  const {atUsers: oldAtUsers} = this;
  const atUsers = await this.getAtUsers();
  const oldAtUsersId = oldAtUsers.map(u => u.uid);
  const newAtUsers = oldAtUsers;
  for(const user of atUsers) {
    // 跳过已经 AT 过的用户
    if(oldAtUsersId.includes(user.uid)) continue;
    newAtUsers.push(user);
    // 发送消息
    const messageId = await SettingModel.operateSystemId('messages', 1);
    const message = MessageModel({
      _id: messageId,
      ty: 'STU',
      r: user.uid,
      c: {
        type: 'at',
        documentId: this._id,
        from: from
      }
    });
    await message.save();
    await socket.sendMessageToUser(message._id);
  }
  this.atUsers = newAtUsers;
  await this.updateOne({
    $set: {
      atUsers: this.atUsers
    }
  });
};



// 设置审核状态（敏感词检测）
schema.methods.setReviewStatus = async function(from) {

};

// 匿名发表相关

// 更新数据
schema.methods.updateData = async function(newData) {

};
// 同步到搜索数据库
schema.methods.pushToSearchDB = async function() {

};
// 获取其中的 @ 用户名称
schema.methods.sendATMessage = async function() {

};
// 获取 html 内容中的笔记选区信息
schema.methods.getNoteMarkInfo = async function() {

};
// 更新笔记选区信息
schema.methods.updateNoteInfo = async function (note) {

};
// 更新内容
schema.methods.updateContent = async function() {

};

module.exports = mongoose.model('documents', schema);
