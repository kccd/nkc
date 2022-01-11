const mongoose = require('../settings/database');
const cheerio = require('cheerio');
const markNotes = require("../nkcModules/nkcRender/markNotes");
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
  // 当前文档的状态 normal: 正常, disabled: 被屏蔽, faulty: 退修
  status: {
    type: String,
    default: 'normal',
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
  // comment, article
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
* 获取文档的内容 ID，全表唯一
* @return {String}
* */
schema.statics.getId = async () => {
  const SettingModel = mongoose.model('settings');
  return await SettingModel.operateSystemID('documentsInner', 1);
};

/*
* 获取文档的引用 ID，编辑版、正式版以及所有历史版的引用 ID 相同
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
    article: 'article',
    draft: 'draft'
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
* 新建编辑版文档
* @param {Object} props
*   @param {String} title 标题
*   @param {String} content 富文本内容
*   @param {String} cover 封面图 ID
*   @param {File} coverFile 封面图文件对象
*   @param {[String]} keywords 关键词
*   @param {[String]} keywordsEN 英文关键词
*   @param {String} abstract 摘要
*   @param {String} abstractEN 英文摘要
*   @param {String} uid 发表人 ID
*   @param {Date} toc 创建时间
*   @param {String} source 来源 参考 DocumentModel.statics.getDocumentSources
*   @param {String} sid 来源所对应的 ID
* @return {Object} document schema 对象
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
* 复制当前文档数据创建历史文档
* @return {Object} history document schema
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

/*
* 根据来源加载编辑版，并复制编辑版内容生成历史版
* @param {String} source 来源 参考 documentModel.statics.getDocumentSources
* @param {String} sid 来源所对应的 ID
* */
schema.statics.copyBetaToHistoryBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  const betaDocument = await DocumentModel.getBetaDocumentBySource(source, sid);
  if(!betaDocument) throwErr(400, `不存在编辑版，无法保存历史`);
  await betaDocument.copyToHistoryDocument();
};

/*
* 将当前版本修改为历史版
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
* @param {Number} did 文档的引用 ID
* @return {Object} document schema
* */
schema.statics.createBetaDocumentByStableDocument = async function(did) {
  const DocumentModel = mongoose.model('documents');
  const NoteModel = mongoose.model('notes');
  const SettingModel = mongoose.model('settings');
  const stableDocument = await DocumentModel.findOne({did, type: 'stable'});
  if(!stableDocument) throwErr(500, `文档 ${did} 不存在正式版，无法生成编辑版`);
  const stableNotes = await NoteModel.getNotesByDocId(stableDocument._id);
  const originDocument = stableDocument.toObject();
  delete originDocument._v;
  originDocument.type = 'beta';
  originDocument._id = await DocumentModel.getId();
  originDocument.toc = new Date();
  const betaDocument = DocumentModel(originDocument);
  await betaDocument.save();
  // 复制笔记选择等信息
  for(const note of stableNotes) {
    let newNote = note.toObject();
    delete newNote._id;
    delete newNote.__v;
    newNote._id = await SettingModel.operateSystemID('notes', 1);
    newNote = NoteModel(newNote);
    newNote.save();
    await note.updateOne({
      $set: {
        targetId: betaDocument._id
      }
    });
  }
  return betaDocument;
};

/*
* 将开发版更新为正式版，将正式版更新为历史版
* @param {Number} did 文档的引用 ID
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
  const needReview = await documentsObj.beta.getReviewStatusAndCreateReviewLog();
  await documentsObj.beta.setReviewStatus(needReview);
  await documentsObj.beta.pushToSearchDB();
};

/*
* 指定 did 更新文档内容
* 如果没有编辑版则复制正式版内容生成编辑版，然后再更新编辑版内容
* @param {Number} did 文档的应用 ID
* @param {Object} props
*   @param {String} title 标题
*   @param {String} content 富文本内容
*   @param {String} cover 封面图 ID
*   @param {File} coverFile 封面图文件对象
*   @param {String} abstract 摘要
*   @param {String} abstractEN 英文摘要
*   @param {[String]} keywords 关键词
*   @param {[String]} keywordsEN 英文关键词
*   @param {Date} tlm 最后更新时间
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
  const html = await DocumentModel.updateNoteInfoAndClearNoteMark(content, betaDocument._id);
  await betaDocument.updateOne({
    $set: {
      title,
      content: html,
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
* 根据来源获取正式版
* @param {String} source 来源 参考 DocumentModel.statics.getDocumentSources
* @param {String} sid 来源多对应的 ID
* @return {Object} stable document schema
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

/*
* 根据来源获取编辑版
* @param {String} source 来源 参考 DocumentModel.statics.getDocumentSources
* @param {String} sid 来源多对应的 ID
* @return {Object} beta document schema
* */
schema.statics.getBetaDocumentBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  await DocumentModel.checkDocumentSource(source);
  return DocumentModel.findOne({
    type: 'beta',
    source,
    sid,
  });
};

/*
* 根据来源获取稳定版内容
* 如果不存在稳定版，则返回清空内容后的编辑版
* @param {String} source 来源 参考 DocumentModel.statics.getDocumentSources
* @param {String} sid 来源所对应的 ID
* @return {Object} stable document schema
* */
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

/*
* 根据来源获取编辑版内容
* 如果不存在编辑版，则返回正式版
* @param {String} source 来源 参考 DocumentModel.statics.getDocumentSources
* @param {String} sid 来源所对应的 ID
* @return {Object} beta document schema
* */
schema.statics.getBetaDocumentContentBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  let betaDocument = await DocumentModel.getBetaDocumentBySource(source, sid);
  if(!betaDocument) {
    betaDocument = await DocumentModel.getStableDocumentBySource(source, sid);
  }
  return betaDocument;
};


/*
* 获取编辑版内容
* */
schema.statics.getEditorBetaDocumentContentBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  const betaDocument = await DocumentModel.getBetaDocumentContentBySource(source, sid);
  await betaDocument.insertNoteMarkToContent();
  return betaDocument;
}

/*
* 插入自定义笔记标签到 document content 中
* */
schema.methods.insertNoteMarkToContent = async function() {
  const {_id} = this;
  const NoteModel = mongoose.model('notes');
  const notes = await NoteModel.getNotesByDocId(_id);
  this.content = markNotes.setMark(this.content, notes.map(note => note.toObject()));
}

/*
* 更新笔记选区信息并清除笔记标签
* @param {String} content
* @param {Number} docId
* */
schema.statics.updateNoteInfoAndClearNoteMark = async function(content, docId) {
  const {html, notes} = markNotes.getMark(content);
  const NoteModel = mongoose.model('notes');
  const notesObj = {};
  for(const n of notes) {
    notesObj[n._id] = n;
  }
  const notesDB = await NoteModel.getNotesByDocId(docId);
  for(const note of notesDB) {
    const newNote = notesObj[note._id] || {
      offset: 0,
      length: 0,
      content: note.content
    };
    await note.updateOne({
      $set: {
        'node.offset': newNote.offset,
        'node.length': newNote.length,
        newContent: newNote.content
      }
    });
  }
  return html;
}

/*
* 根据来源获取渲染富文本之后的稳定版
* @param {String} source 来源 参考 DocumentModel.statics.getDocumentSources
* @param {String} sid 来源所对应的 ID
* @param {String} uid 访问者 ID（用于 nkcRender 中的权限判断）
* @return {Object} DocumentModel.methods.getRenderingData @return
* */
schema.statics.getStableDocumentRenderingContent = async (source, sid, uid) => {
  const DocumentModel = mongoose.model('documents');
  const stableDocument = await DocumentModel.getStableDocumentContentBySource(source, sid);
  return stableDocument.getRenderingData(uid);
};

/*
* 渲染当前文档的富文本内容并返回、
* @param {String} 访问者 ID
* @return {Object}
*   @param {String} time 格式化后的时间
*   @param {String} coverUrl 封面图链接
*   @param {String|null} mTime 格式化后的最后修改时间
*   @param {String} title 标题
*   @param {String} content 渲染后的富文本内容
* */
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
    source: 'document',
    sid: this._id
  });
  return {
    time: timeFormat(this.toc),
    coverUrl: this.cover? getUrl('documentCover', this.cover): '',
    mTime: this.tlm? fromNow(this.tlm): null,
    title: this.title || '未填写标题',
    content
  }
}

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
        did: this._id
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

/*
* 检测用户是否有权发表指定来源的内容
* @param {String} uid 发表人 ID
* @param {String} source 来源 参考 DocumentModel.statics.getDocumentSources
* @param {String} type 类型 默认 stable, 可选 stable, history, beta
* */
schema.statics.checkGlobalPostPermission = async (uid, source, type = 'stable') => {
  const DocumentModel = mongoose.model('documents');
  const SettingModel = mongoose.model('settings');
  const UserModel = mongoose.model('users');
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const apiFunction = require('../nkcModules/apiFunction');
  await DocumentModel.checkDocumentSource(source);
  const documentPostSettings = await SettingModel.getSettings('documentPost');
  const {postPermission} = documentPostSettings[source];
  const user = await UserModel.findOnly({uid});
  const usersPersonal = await UsersPersonalModel.findOnly({uid});
  const authLevel = await usersPersonal.getAuthLevel();
  const {
    authLevelMin,
    examVolumeA,
    examVolumeB,
    examNotPass,
    defaultInterval,
    defaultCount,
    intervalLimit = []
  } = postPermission;

  // 身份认证判断
  if(authLevel < authLevelMin) {
    throwErr(403, `身份认证等级未达要求，请至少完成身份认证 ${authLevelMin}`);
  }
  // 获取今日发表数
  const today = apiFunction.today();
  const documentCountToday = await DocumentModel.countDocuments({
    uid,
    type,
    source,
    toc: {$gte: today}
  });
  // 考试判断
  if((!examVolumeA || !user.volumeA) && (!examVolumeB || !user.volumeB)) {
    if(!examNotPass.status) {
      if(!examVolumeA && !examVolumeB) {
        throwErr(403, `发表功能已关闭`);
      } else {
        throwErr(403, `请参加考试，通过后可获得发表权限`);
      }
    }
    if(examNotPass.count <= documentCountToday) {
      if(!examVolumeA && !examVolumeB) {
        throwErr(403, `今日发表次数已达上限（${examNotPass} 次），请明天再试`);
      } else {
        throwErr(403, `今日发表次数已达上限（${examNotPass} 次），请参加考试，通过后可获取更多发表权限`);
      }
    }
  }
  // 发表间隔、数量限制
  const roles = await user.extendRoles();
  const grade = await user.extendGrade();
  const rolesId = roles.map(r => `role-${r._id}`);
  rolesId.push(`grade-${grade._id}`);
  let intervalItem = null;
  let countItem = null;
  for(const item of intervalLimit) {
    if(!rolesId.includes(item.id)) continue;
    if(intervalItem && !intervalItem.limited) continue;
    if(!intervalItem || !item.limited || item.interval > intervalItem.interval) {
      intervalItem = item;
    }
  }
  for(const item of countLimit) {
    if(!rolesId.includes(item.id)) continue;
    if(countItem && !countItem.limited) continue;
    if(!countItem || !item.limited || item.count > countItem.count) {
      countItem = item;
    }
  }
  intervalItem = intervalItem || defaultInterval;
  countItem = defaultCount;
  if(intervalItem.limited) {
    const latestDocument = await DocumentModel.countDocuments({
      uid,
      type,
      source,
      toc: {$gte: Date.now() - intervalItem.interval * 60 * 1000}
    }).sort({toc: -1});
    if(latestDocument) {
      throwErr(403, `您当前的账号等级限定发表间隔时间不能小于 ${intervalItem.interval} 分钟，请稍候再试`);
    }
  }
  if(
    countItem.limited &&
    documentCountToday >= countItem.count
  ) {
    throwErr(403, `您当前的账号等级限定每天发表次数不能超过 ${countItem.count} 次，请明天再试`);
  }
};

/*
* 根据后台发表内容设置，获取审核状态
* */
schema.methods.getGlobalPostReviewStatus = async function() {
  const {source, uid} = this;
  const SettingModel = mongoose.model('settings');
  const UserModel = mongoose.model('users');
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const UsersGeneralModel = mongoose.model('usersGeneral');
  const documentPostSettings = await SettingModel.getSettings('documentPost');
  const {postReview} = documentPostSettings[this.source];
  const user = await UserModel.findOnly({uid});
  const {reviewedCount} = await UsersGeneralModel.findOnly({uid}, {reviewedCount: 1});
  const {nationCode} = await UsersPersonalModel.getUserPhoneNumber(uid);
  const {foreign, notPassVolumeA, whitelist, blacklist} = postReview;

  const roles = await user.extendRoles();
  const grade = await user.extendGrade();
  const roleList = roles.map(r => `role-${r._id}`);
  roleList.push(`grade-${grade._id}`);
  // 白名单
  for(const r of roleList) {
    if(whitelist.includes(r)) {
      return {
        needReview: false,
      }
    }
  }
  // 海外手机号注册用户
  if(
    nationCode !== foreign.nationCode &&
    (
      foreign.type === 'all' ||
      foreign.type === 'count' && reviewedCount[source] < foreign.count
    )
  ) {
    return {
      needReview: true,
      type: 'foreign',
      reason: '海外手机号用户，审核通过的文章数量不足'
    };
  }

  // 未通过 A 卷考试
  if(
    !user.volumeA &&
    (
      notPassVolumeA.type === 'all' ||
      notPassVolumeA.type === 'count' && reviewdCount[source] < notPassVolumeA.count
    )
  ) {
    return {
      needReview: true,
      type: 'notPassedA',
      reason: '用户没有通过A卷考试，审核通过的文章数量不足'
    };
  }

  // 黑名单
  for(const bl of blacklist) {
    if(!roleList.includes(bl.id) || bl.type === 'none') continue;
    if(
      bl.type === 'all' ||
      (bl.type === 'count' && reviewdCount[source] < bl.count)
    ) {
      return {
        needReview: true,
        type: 'grade',
        reason: '因用户等级限制，审核通过的文章数量不足'
      }
    }
  }
}
/*
* 获取用户关于复验手机号的审核状态
* */
schema.methods.getVerifyPhoneNumberReviewStatus = async function() {
  const UsersPersonalModel = mongoose.model('usersPersonal');
  if(await UsersPersonalModel.shouldVerifyPhoneNumber(this.uid)) {
    return {
      needReview: true,
      type: 'unverifiedPhone',
      reason: '用户未验证手机号'
    }
  } else {
    return {
      needReview: false
    }
  }
};

/*
* 获取敏感词审核状态
* */
schema.methods.getKeywordsReviewStatus = async function() {
  const SettingModel = mongoose.model('settings');
  const ReviewModel = mongoose.model('reviews');
  const documentPostSettings = await SettingModel.getSettings('documentPost');
  const {keywordGroupId} = documentPostSettings[this.source].postReview;
  const {
    content = '',
    title = '',
    abstract = '',
    abstractEN = '',
  } = this;
  const keywords = this.keywords || [];
  const keywordsEN = this.keywordsEN || [];
  const documentContent = content + title + abstract + abstractEN + (keywords.concat(keywordsEN)).join(' ');
  const matchedKeywords = await ReviewModel.matchKeywords(documentContent, keywordGroupId);
  if(matchedKeywords.length > 0) {
    return {
      needReview: true,
      type: 'includesKeyword',
      reason: `内容中包含敏感词 ${matchedKeywords.join("、")}`
    }
  } else {
    return {
      needReview: false
    }
  }
};
// 获取审核状态，生成审核记录
schema.methods.getReviewStatusAndCreateReviewLog = async function() {
  const ReviewModel = mongoose.model('reviews');
  let reviewStatus = await this.getGlobalPostReviewStatus();
  if(!reviewStatus.needReview) {
    reviewStatus = await this.getVerifyPhoneNumberReviewStatus();
  }
  if(!reviewStatus.needReview) {
    reviewStatus = await this.getKeywordsReviewStatus();
  }
  const {needReview, reason, type} = reviewStatus;
  if(needReview) {
    await ReviewModel.newDocumentReview(type, this._id, this.uid, reason);
  }
  return needReview;
}

// 设置审核状态
schema.methods.setReviewStatus = async function(reviewed) {
  await this.updateOne({
    $set: {
      reviewed
    }
  });
};

// 匿名发表相关

// 同步到搜索数据库
schema.methods.pushToSearchDB = async function() {
  const {
    content,
    title,
    source,
    toc,
    uid,
    did,
    abstract,
    abstractEN,
    keywords,
    keywordsEN
  } = this;
  const elasticSearch = require('../nkcModules/elasticSearch');
  await elasticSearch.save(`document_${source}`, {
    tid: did,
    uid,
    toc,
    t: title,
    c: content,
    abstractEN: abstractEN,
    abstractCN: abstract,
    keywordsCN: keywords || [],
    keywordsEN: keywordsEN || [],
  });
};

module.exports = mongoose.model('documents', schema);
