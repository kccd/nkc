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
  return await SettingModel.operateSystemID('documentsInner');
};

/*
* 获取文档被引用 ID
* @return {String}
* */
schema.statics.getDid = async () => {
  const SettingModel = mongoose.model('settings');
  return await SettingModel.operateSystemID('documents');
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
  const documentSources = DocumentModel.getDocumentSources();
  const sourceNames = Object.values(documentSources);
  if(!sourceNames.includes(source)) throwErr(500, `document source error. source=${source}`);
};

/*
* 创建文档
* */
schema.statics.createDocument = async (props) => {
  const {
    title,
    content,
    cover,
    coverFile,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    uid,
    toc,
    source,
    sid,
  } = props;
  const DocumentModel = mongoose.model('documents');
  const AttachmentModel = mongoose.model('attachments');
  const _id = await DocumentModel.getId();
  const did = await DocumentModel.getDid();
  const document = DocumentModel({
    _id,
    did,
    uid,
    title,
    content,
    cover,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    toc,
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
schema.methods.saveDocument = async function() {
  const DocumentModel = mongoose.model('documents');
  const originDocument = this.toObject();
  delete originDocument._v;
  originDocument.type = 'history';
  originDocument._id = await DocumentModel.getId();
  const document = DocumentModel(originDocument);
  await document.save();
};

/*
* 更新开发版内容
* */
schema.methods.updateDocument = async function(props) {
  const DocumentModel = mongoose.model('documents');
  const {
    title = '',
    content = '',
    cover = '',
    coverFile,
  } = props;
  const {getHTMLTextLength} = require('../nkcModules/checkData');
};

/*
* 将开发版更新为正式版，将正式版更新为历史版
* */
schema.methods.publishDocument = async function() {

};


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

/*
* 创建 document
* @param {Object} props
*   @param {String} title 标题
*   @param {String} content 富文本内容
*   @param {File} coverFile 封面图
*   @param {String} uid 作者
*   @param {Date} time 创建时间
* @return {Object} Document
* */
schema.statics.createDocument = async (props) => {
  const {
    title,
    cover,
    content = '',
    coverFile,
    uid,
    time
  } = props;
  const DocumentModel = mongoose.model('documents');
  const SettingModel = mongoose.model('settings');
  const AttachmentModel = mongoose.model('attachments');
  const documentId = await SettingModel.operateSystemID('documents', 1);
  const {getHTMLTextLength} = require('../nkcModules/checkData');
  const wordCount = getHTMLTextLength(content);
  const document = new DocumentModel({
    _id: documentId,
    title,
    cover,
    content,
    wordCount,
    uid,
    toc: time
  });
  await document.save();
  await document.updateResourceReferences();
  if(coverFile) {
    await AttachmentModel.saveDocumentCover(documentId, coverFile);
  }
  return document;
};

/*
* 更新 document
* @param {Object} props
*   @param {String} title 标题
*   @param {String} content 富文本内容
*   @param {String} cover 原封面图 ID
*   @param {File} coverFile 新的封面图文件对象
* */
schema.methods.updateDocument = async function(props) {
  const {
    title = '',
    content = '',
    cover = '',
    coverFile,
  } = props;
  const {getHTMLTextLength} = require('../nkcModules/checkData');
  const AttachmentModel = mongoose.model('attachments');
  const DocumentModel = mongoose.model('documents');
  const wordCount = getHTMLTextLength(content);
  await this.updateOne({
    $set: {
      title,
      content,
      wordCount,
      cover,
      tlm: new Date()
    }
  });
  const _this = await DocumentModel.findOnly({_id: this._id});
  await _this.updateResourceReferences();
  if(coverFile) {
    await AttachmentModel.saveDocumentCover(this._id, coverFile);
  }
}
/*
* 将 document 设置为历史
* @param {Number} newDocumentId 当前历史 document 所对应的新版本 document
* */
schema.methods.setAsHistory = async function(newDocumentId) {
  await this.updateOne({
    $set: {
      originId: newDocumentId
    }
  });
}

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
  return `document_${this._id}`;
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
