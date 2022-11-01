const mongoose = require('../settings/database');
const cheerio = require('cheerio');
const markNotes = require("../nkcModules/nkcRender/markNotes");

/*
* document状态
* 当document状态发生改变时会同步当前状态到上层
* 上层 documentSources
* */
const documentStatus = {
  'default': 'default', // 默认状态 创建了但未进行任何操作
  disabled: "disabled",// 禁用
  unknown: 'unknown',// 未审核
  normal: "normal",// 正常状态 能被所有用户查看的文档
  faulty: "faulty", // 退修
  cancelled: 'cancelled', // 取消发布
};

const documentTypes = {
  stable: "stable",
  beta: "beta",
  betaHistory: "betaHistory",
  stableHistory: "stableHistory",
};

const documentSources = {
  article: 'article',
  draft: 'draft',
  comment: 'comment',
  moment: 'moment'
};

const schema = new mongoose.Schema({
  // 当前文档的 ID，唯一
  _id: Number,
  // 展示层记录的文档 ID，同一文档的不同版本（正式版、编辑版、历史版）此字段值相同
  did: {
    type: Number,
    required: true,
    index: 1
  },
  // 版本类型 stable, beta, betaHistory //编辑版历史, stableHistory //正式版历史,
  type: {
    type: String,
    required: true,
    index: 1
  },
  //引用的documentId
  quoteDid: {
    type: String,
    default: '',
    index: 1,
  },
  // 当前文档的状态
  // default: 默认状态
  // normal: 正常
  // disabled: 被屏蔽
  // faulty: 被退修
  // unknown: 未知（默认状态，需要审核才能确定）
  status: {
    type: String,
    default: documentStatus.default,
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
  //是否原创
  //   0 "不声明",
  //   1 "普通转载",
  //   2 "获授权转载",
  //   3 "受权发表(包括投稿)",
  //   4 "发表人参与原创(翻译)",
  //   5 "发表人是合作者之一",
  //   6 "发表人本人原创"
  origin: {
    type: Number,
    default: 0,
    index: 1
  },
  authorInfos: {
    type: [
      Object,
      /*{
        name: '姓名',
        kcid: 'ID',
        agency: '机构名称',
        agencyCountry: '未使用',
        agencyAdd: '机构地址',
        isContract: '包含通信作者信息',
        contractObj: {
          contractEmail: '通信作者邮箱',
          contractTel: '通信作者电话',
          contractAdd: '通讯作者地址',
          contractCode: '通信作者邮政编码'
        }
      }*/
    ],
    default: [],
    index: 1
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
    default: '',
  },
  // 归属地
  addr: {
    type: String,
    default: '',
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
  return documentSources;
};

/*
* 获取文档所有的状态类型
* */
schema.statics.getDocumentStatus = async () => {
  return documentStatus;
};

schema.statics.getDocumentTypes = async () => {
  return documentTypes;
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
* 检测文档状态是否有效
* @param {String} status 状态
* */
schema.statics.checkDocumentStatus = async (status) => {
  const DocumentModel = mongoose.model('documents');
  const documentStatus = await DocumentModel.getDocumentStatus();
  const typeNames = Object.values(documentStatus);
  if(!typeNames.includes(status)) throwErr(500, `document status error. status=${status}`);
}

/*
* 检测文档类型是否有效
* @param {String} type 状态
* */
schema.statics.checkDocumentType = async (type) => {
  const DocumentModel = mongoose.model('documents');
  const documentTypes = await DocumentModel.getDocumentTypes();
  const typeNames = Object.values(documentTypes);
  if(!typeNames.includes(type)) throwErr(500, `document type error. type=${type}`);
}

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
*   @param {Array} authorInfos 作者信息
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
    origin = '',
    authorInfos = [],
    uid,
    toc,
    source,
    sid,
    ip,
    port
  } = props;
  const IPModel = mongoose.model('ips');
  const DocumentModel = mongoose.model('documents');
  const AttachmentModel = mongoose.model('attachments');
  const {getHTMLTextLength} = require('../nkcModules/checkData');
  await DocumentModel.checkDocumentSource(source);
  const wordCount = getHTMLTextLength(content);
  const _id = await DocumentModel.getId();
  const did = await DocumentModel.getDid();
  const ipId = await IPModel.saveIPAndGetToken(ip);
  const addr = await IPModel.getIpAddr(ip);
  const document = await DocumentModel({
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
    origin,
    authorInfos,
    toc,
    dt: toc,
    type: (await DocumentModel.getDocumentTypes()).beta,
    source,
    sid,
    ip: ipId,
    port,
    addr,
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
* @return {Object} betaHistory document schema
* */
schema.methods.copyToHistoryDocument = async function(status) {
  const DocumentModel = mongoose.model('documents');
  const NoteModel = mongoose.model('notes');
  const originDocument = this.toObject();
  delete originDocument._v;
  originDocument.type = (await DocumentModel.getDocumentTypes()).betaHistory;
  originDocument._id = await DocumentModel.getId();
  originDocument.toc = new Date();
  (status === 'edit') && (originDocument.tlm = new Date());
  const document = DocumentModel(originDocument);
  await document.save();
  await NoteModel.copyDocumentNoteAndUpdateNewNoteTargetId(this._id, document._id);
  return document;
};
/*
  *复制当前文档创建历史记录，并把当前文档改为编辑版。并且正在编辑的文档改为历史版
  *param {String} uid 用户id
  *param {String} sid document的sid
  *param {String} source 文章类型
  *
*/
schema.statics.copyToHistoryToEditDocument = async function(uid, sid, source, _id){
  const DocumentModel = mongoose.model('documents');
  const currentDocument = await DocumentModel.findOne({uid, _id, type: documentTypes.betaHistory})
  if(!currentDocument) throwErr(400, `当前文章不存在，请刷新页面重试`);
  // 复制当前文档数据创建历史文档
  await currentDocument.copyToHistoryDocument('edit');
  // 更改当前正在编辑版本为历史版
  await this.updateOne({
    uid,
    sid,
    source,
    type: "beta"
  }, {
    $set: {
        type: (await DocumentModel.getDocumentTypes()).betaHistory,
        // toc: new Date(),
        tlm: new Date()
    }
  })
  // 设置当前历史版为 编辑版
  await currentDocument.modifyAsEditDocument();
}
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
* 根据来源加载编辑版
* 判断当前距上次报错历史是否超过30分钟，超过30分钟则保存新历史，未超过则与历史版内容比较
* 有变动则存新历史，没有变动则退出
* @param {String} source 来源
* @param {String} sid 来源 ID
* */
schema.statics.checkContentAndCopyBetaToHistoryBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  const betaDocument = await DocumentModel.getBetaDocumentBySource(source, sid);
  if(!betaDocument) throwErr(400, '不存在编辑版，无法保存历史');
  const time = Date.now();
  const latestHistoryDocument = await DocumentModel.getLatestHistoryDocumentBySource(source, sid);

  let needHistory = false;

  if(
    // 如果没有历史版本则直接保存
    !latestHistoryDocument ||
    // 如果超过 30 分钟未保存历史则保存
    time - latestHistoryDocument.toc.getTime() > 30 * 60 * 1000 ||
    // 如果内容有变动则保存
    betaDocument.cover !== latestHistoryDocument.cover ||
    betaDocument.origin !== latestHistoryDocument.origin
  ) {
    needHistory = true;
  }

  if(!needHistory) {

    const betaTitle = betaDocument.title || '';
    const betaWordCount = betaDocument.wordCount || 0;
    const betaAbstractEN = betaDocument.abstractEN || '';
    const betaAbstract = betaDocument.abstract || '';
    const betaKeywordsEN = betaDocument.keywordsEN || [];
    const betaKeywords = betaDocument.keywords || [];

    const latestHistoryTitle = latestHistoryDocument.title || '';
    const latestHistoryWordCount = latestHistoryDocument.wordCount || 0;
    const latestHistoryAbstractEN = latestHistoryDocument.abstractEN || '';
    const latestHistoryAbstract = latestHistoryDocument.abstract || '';
    const latestHistoryKeywordsEN = latestHistoryDocument.keywordsEN || [];
    const latestHistoryKeywords = latestHistoryDocument.keywords || [];

    // 统计内容字数变动
    let count = 0;
    count += betaTitle.length - latestHistoryTitle.length;
    count += betaWordCount - latestHistoryWordCount;
    count += betaKeywords.join('').length - latestHistoryKeywords.join('').length;
    count += betaKeywordsEN.join('').length - latestHistoryKeywordsEN.join('').length;
    count += betaAbstract.length - latestHistoryAbstract.length;
    count += betaAbstractEN.length - latestHistoryAbstractEN.length;
    count = Math.abs(count);
    // 若内容字数变动超过100，则存历史
    if(count > 100) {
      needHistory = true;
    }
  }
  if(needHistory) {
    await betaDocument.copyToHistoryDocument();
  }
}

// 将当前版本设置为编辑版，并设置最后修改时间
schema.methods.modifyAsEditDocument = async function() {
  const DocumentModel = mongoose.model('documents');
  await this.updateOne({
    $set: {
      type: (await DocumentModel.getDocumentTypes()).beta,
      // toc: new Date(),
      tlm: new Date()
    }
  });
};
/*
* 将当前版本修改为编辑版
* */
schema.methods.setAsEditDocument = async function() {
  const DocumentModel = mongoose.model('documents');
  await this.updateOne({
    $set: {
      type: (await DocumentModel.getDocumentTypes()).beta
    }
  });
};

/*
* 将 document 由编辑版设为历史版
* @param {String} source document 来源
* @param {String} sid document 来源所对应的 ID
* */
//将专栏编辑版改为历史版
schema.statics.setBetaDocumentAsHistoryBySource = async (source, sid) =>{
  const DocumentModel = mongoose.model('documents');
  const historyType = (await DocumentModel.getDocumentTypes()).betaHistory
  const betaDocument = await DocumentModel.getBetaDocumentBySource(source, sid);
  if(!betaDocument) return;
  await betaDocument.updateOne({
    $set: {
      type: historyType,
      tlm: new Date()
    }
  });
}
/*
* 将当前版本修改为历史版
* */
schema.methods.setAsHistoryDocument = async function() {
  const DocumentModel = mongoose.model('documents');
  await this.updateOne({
    $set: {
      type: (await DocumentModel.getDocumentTypes()).stableHistory,
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
  const stableDocument = await DocumentModel.findOne({did, type: 'stable'});
  if(!stableDocument) throwErr(500, `文档 ${did} 不存在正式版，无法生成编辑版`);
  const originDocument = stableDocument.toObject();
  delete originDocument._v;
  originDocument.type = (await DocumentModel.getDocumentTypes()).beta;
  originDocument._id = await DocumentModel.getId();
  originDocument.toc = new Date();
  originDocument.status = DocumentModel.getDocumentStatus().unknown;
  const betaDocument = DocumentModel(originDocument);
  await betaDocument.save();
  await NoteModel.copyDocumentNoteAndUpdateOriginNoteTargetId(stableDocument._id, betaDocument._id);
  return betaDocument;
};

/*
* 将开发版更新为正式版，将正式版更新为历史版
* 将记录同步到搜索数据库
* @param {Number} did 文档的引用 ID
* @param {}
* */
schema.statics.publishDocumentByDid = async (did, options = {}) => {
  const DocumentModel = mongoose.model('documents');
  const {checkString} = require('../nkcModules/checkData');
  const {
    jumpReview = false, // 是否跳过审核
  } = options;
  const {stable, beta} = await DocumentModel.getDocumentTypes();
  const type = [stable, beta];
  const documentsObj = {};
  const documents = await DocumentModel.find({
    did,
    type: {$in: type}
  });
  for(const d of documents) {
    documentsObj[d.type] = d;
  }
  if(!documentsObj.beta) throwErr(400, `不存在编辑版，无需发表`);
  //判断专栏文章编辑版是否填写标题
  if((documentsObj.beta).source === 'column') {
    checkString((documentsObj.beta).source, {
      name: '文章标题',
      minTextLength: 1,
      maxLength: 500
    })
  }
  //如果存在正式版就将正式版变为正式历史版，更新修改时间
  if(documentsObj.stable) await documentsObj.stable.setAsHistoryDocument();
  await documentsObj.beta.updateOne({
    $set: {
      type: type[0],
      tlm: documentsObj.stable ? new Date() : null,
    }
  });
  //是否需要审核
  const needReview = jumpReview? false: (await documentsObj.beta.getReviewStatusAndCreateReviewLog());
  if(needReview) {
    await documentsObj.beta.setStatus((await DocumentModel.getDocumentStatus()).unknown);
  } else {
    //不需要审核
    //检测document中的@用户并发送消息给用户
    await documentsObj.beta.setStatus((await DocumentModel.getDocumentStatus()).normal);
    await documentsObj.beta.sendMessageToAtUsers('article');
  }
  //同步到search数据库
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
    origin,
    authorInfos,
    quoteDid = '',
  } = props;
  const AttachmentModel = mongoose.model('attachments');
  const DocumentModel = mongoose.model('documents');
  const {getHTMLTextLength} = require('../nkcModules/checkData');
  const wordCount = getHTMLTextLength(content);
  let betaDocument = await DocumentModel.findOne({
    did,
    type: (await DocumentModel.getDocumentTypes()).beta
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
      tlm,
      origin,
      authorInfos,
      quoteDid
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
    type: (await DocumentModel.getDocumentTypes()).stable,
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
    type: (await DocumentModel.getDocumentTypes()).beta,
    source,
    sid,
  });
};

schema.statics.getLatestHistoryDocumentBySource = async (source, sid) => {
  const DocumentModel = mongoose.model('documents');
  await DocumentModel.checkDocumentSource(source);
  const documentTypes = await DocumentModel.getDocumentTypes();
  return DocumentModel.findOne({
    type: {
      $in: [
        documentTypes.betaHistory,
        documentTypes.stableHistory
      ]
    },
    source,
    sid
  }).sort({toc: -1});
}

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
  return `document-${this.did}`;
}
/*
* @params {String} sid 根据sid 获取 document
*/
schema.statics.getStableArticleById =async (sid)=>{
  const DocumentModel = mongoose.model('documents');
  const source = (await DocumentModel.getDocumentSources()).article
  const type = (await DocumentModel.getDocumentTypes()).stable
  return await DocumentModel.findOne({
    sid,
    source,
    type
  })
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
  const UserModel = mongoose.model('users');
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
      let user;
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
  const {atUsers: oldAtUsers, source} = this;
  if(
    ![
      documentSources.moment,
      documentSources.article,
      documentSources.comment,
    ].includes(source)
  ) return;
  const atUsers = await this.getAtUsers();
  const oldAtUsersId = oldAtUsers.map(u => u.uid);
  const newAtUsers = oldAtUsers;
  for(const user of atUsers) {
    // 跳过已经 AT 过的用户
    if(oldAtUsersId.includes(user.uid)) continue;
    newAtUsers.push(user);
    // 发送消息
    const messageId = await SettingModel.operateSystemID('messages', 1);
    const message = MessageModel({
      _id: messageId,
      ty: 'STU',
      r: user.uid,
      c: {
        type: `${source}At`,
        did: this.did,
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
* @param {String} type 类型 默认 stable, 可选 stable, betaHistory, stableHistory, beta
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
    intervalLimit = [],
    countLimit = [],
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
    if(examNotPass.limited && examNotPass.count <= documentCountToday) {
      if(!examVolumeA && !examVolumeB) {
        throwErr(403, `今日发表次数已达上限（${examNotPass.count} 次），请明天再试`);
      } else {
        throwErr(403, `今日发表次数已达上限（${examNotPass.count} 次），请参加考试，通过后可获取更多发表权限`);
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
      notPassVolumeA.type === 'count' && reviewedCount[source] < notPassVolumeA.count
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
      (bl.type === 'count' && reviewedCount[source] < bl.count)
    ) {
      return {
        needReview: true,
        type: 'grade',
        reason: '因用户等级限制，审核通过的文章数量不足'
      }
    }
  }

  return {
    needReview: false
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
  const matchedKeywords = await ReviewModel.matchKeywordsByGroupsId(documentContent, keywordGroupId);
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
  const DocumentModel = mongoose.model('documents');
  //用户是否满足后台设置的需要审核的设置
  let reviewStatus = await this.getGlobalPostReviewStatus();
  if(!reviewStatus.needReview) {
    //获取用户是否验证手机号
    reviewStatus = await this.getVerifyPhoneNumberReviewStatus();
  }
  if(!reviewStatus.needReview) {
    //获取敏感词关键字
    reviewStatus = await this.getKeywordsReviewStatus();
  }
  let {needReview, reason, type} = reviewStatus;
  //如果需要审核，就生成审核记录
  if(needReview) {
    await ReviewModel.newDocumentReview(type, this._id, this.uid, reason);
  }
  return needReview;
}
schema.methods.syncParentStatus = async function() {
  const DocumentModel = mongoose.model('documents');
  const ArticleModel = mongoose.model('articles');
  const CommentModel = mongoose.model('comments');
  const MomentModel = mongoose.model('moments');
  const creationDrafts= mongoose.model('creationDrafts');
  const {source, did, status} = this;
  const {article, comment, moment, draft} = await DocumentModel.getDocumentSources();
  if(source === article) {
    await ArticleModel.setStatus(did, status);
  } else if(source === comment) {
    await CommentModel.setStatus(did, status);
  } else if(source === moment) {
    await MomentModel.setStatus(did, status);
  } else if(source === draft) {
    await creationDrafts.setStatus(did, status);
  }
}
// 设置审核状态 当document的状态改变时，同时去改变上层来源的状态
schema.methods.setStatus = async function(status) {
  this.status = status;
  await this.updateOne({
    $set: {
      status: this.status,
    }
  });
  await this.syncParentStatus();
};

/*
* 拓展document
* */
schema.statics.extendDocuments = async function(documents) {
  return documents;
}

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
  })
    .catch(err => {
      console.log(err);
    })
};

/*
* 向document中插入引用信息
* */
schema.methods.initQuote = async function (quoteDid) {
  const DocumentModel = mongoose.model('documents');
  const document = await DocumentModel.findOnly({_id: quoteDid, type: 'stable'});
  if(!document) throwErr(400, '未找到引用信息');
  await this.updateOne({
    $set: {
      quoteDid
    }
  })
}


/*
* 将 document 数组转换为对象，键名为 document.did，值为 document
* @param {[Document]} documents document 对象组成的数组
* @return {Object}
* */
schema.statics.documentArrayToObject = async (documents) => {
  const documentsObj = {};
  for(const document of documents) {
    documentsObj[document.did] = document;
  }
  return documentsObj;
};

/*
* 通过上层应用类型和 ID，获取编辑版数据
* @param {String} source 来源
* @param {[String]} sourcesId 来源 ID 组成的数组
* @param {String} format array: 数组对象, object: 对象（以 sid 为键，document 为值）
* @return {[Document] or Object}
* */
schema.statics.getBetaDocumentsBySource = async (source, sourcesId, format = 'array') => {
  const DocumentModel = mongoose.model('documents');
  const {beta} = await DocumentModel.getDocumentTypes();
  return await DocumentModel.getDocumentsBySource(beta, source, sourcesId, format);
};

/*
* 通过上层应用类型和 ID，获取正式版数据
* @param {String} source 来源
* @param {[String]} sourcesId 来源 ID 组成的数组
* @param {String} format array: 数组对象, object: 对象（以 sid 为键，document 为值）
* @return {[Document] or Object}
* */
schema.statics.getStableDocumentsBySource = async (source, sourcesId, format = 'array') => {
  const DocumentModel = mongoose.model('documents');
  const {stable} = await DocumentModel.getDocumentTypes();
  return await DocumentModel.getDocumentsBySource(stable, source, sourcesId, format);
}

/*
* 通过上层应用类型和 ID，获取指定版本的数据
* @param {String} type 数据版本类型 详情：DocumentModel.getDocumentTypes
* @param {String} source 来源 详情：DocumentModel.getDocumentSources
* @param {[String]} sourcesId 来源 ID 组成的数组
* @param {String} format array: 数组对象, object: 对象（以 sid 为键，document 为值）
* @return {[Document] or Object}
* */
schema.statics.getDocumentsBySource = async (type, source, sourcesId, format = 'array') => {
  const DocumentModel = mongoose.model('documents');
  await DocumentModel.checkDocumentSource(source);
  const {beta, stable} = await DocumentModel.getDocumentTypes();
  if(![beta, stable].includes(type)) throwErr(500, `document type error. type=${type}`);
  const documents = await DocumentModel.find({
    type,
    source,
    sid: {$in: sourcesId}
  });
  const documentsObj = {};
  documents.forEach((document)=>{
    documentsObj[document.sid] = document;
  });
  if(format === 'array') {
    const results = [];
    for(const sid of sourcesId) {
      const document = documentsObj[sid];
      if(!document) continue;
      results.push(document);
    }
    return results;
  }
  return documentsObj;
}

schema.statics.getDocumentsUrlByDocumentsId = async (documentsId) => {
  const DocumentModel = mongoose.model('documents');
  const ArticleModel = mongoose.model('articles');
  const CommentModel = mongoose.model('comments');
  const {getUrl} = require('../nkcModules/tools');
  const documentSources = await DocumentModel.getDocumentSources();
  const documents = await DocumentModel.find({_id: {$in: documentsId}});
  const articlesId = [];
  const commentsId = [];
  for(const document of documents) {
    const {source, sid} = document;
    if(source === documentSources.article) {
      articlesId.push(sid);
    } else if(source === documentSources.comment) {
      commentsId.push(sid);
    }
  }
  const articlesObj = await ArticleModel.getArticlesObjectByArticlesId(articlesId);
  const comments = await CommentModel.getCommentsObjectByCommentsId(commentsId);
  const commentsInfo = await CommentModel.getCommentsInfo(Object.values(comments));
  const commentsUrl = {};
  for(const commentInfo of commentsInfo) {
    commentsUrl[commentInfo._id] = commentInfo.url;
  }
  const results = {};
  for(const document of documents) {
    const {_id, source, sid} = document;
    let url = '';
    if(source === documentSources.article) {
      const article = articlesObj[sid];
      if(article) {
        const {articleUrl} = await ArticleModel.getArticleUrlBySource(article._id, article.source, article.sid);
        url = articleUrl;
      }
    } else if(source === documentSources.moment) {
      url = getUrl('zoneMoment', sid);
    } else if(source === documentSources.comment) {
      url = commentsUrl[sid];
    }
    results[_id] = url;
  }
  return results;
};

/*
* 对document执行科创币的加减
* */
schema.statics.insertSystemRecordContent = async (type, user, ctx) => {
  const SettingModel = mongoose.model('settings');
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const UserModel = mongoose.model('users');
  const KcbsTypeModel = mongoose.model('kcbsTypes');
  const ScoreOperationLogModel = mongoose.model('scoreOperationLogs');
  const {address: ip, port, data, state = {}} = ctx;
  if(!user) return;
  //获取后台积分设置
  const enabledScores = await SettingModel.getEnabledScores();
  let recordsId = [];
  for(const enabledScore of enabledScores) {
    const scoreType = enabledScore.type;
    const kcbsType = await KcbsTypeModel.findOnly({_id: type});
    const number = kcbsType.num * 100;
    if(number === undefined) continue;
    if(number === 0) continue;
    let from, to;
    let num = Math.abs(number);
    if(number > 0) {
      // 加分
      from = 'bank';
      to = user.uid;
    } else {
      // 减分
      from = user.uid;
      to = 'bank';
    }
    const kcbsRecordId = await SettingModel.operateSystemID('kcbsRecords', 1);
    const newRecords = KcbsRecordModel({
      _id: kcbsRecordId,
      from,
      to,
      num,
      scoreType,
      type,
      ip,
      port,
    });
    if(data.targetUser && data.user) {
      if(data.user !== user) {
        newRecords.tUid = data.user.uid;
      } else {
        newRecords.tUid = data.targetUser.uid;
      }
    }
    let document;
    if(data.document) {
      document = data.document;
    }
    if(document) {
      newRecords.tid = document._id;
    }
    // 操作涉及到的资源的资源id
    if(data.rid) {
      newRecords.rid = data.rid;
    }
    if(data.problem) newRecords.problemId = data.problem._id;
    await newRecords.save();
    recordsId.push(kcbsRecordId);
  }
  // 已创建积分账单记录
  if(recordsId.length) {
    const scoreOperationLog = ScoreOperationLogModel({
      _id: await SettingModel.operateSystemID('scoreOperationLogs', 1),
      uid: user.uid,
      type,
      ip,
      port,
      recordsId
    });
    await scoreOperationLog.save();
    await UserModel.updateUserScores(user.uid);
  }
}

/*
* 定时屏蔽退修超时未修改的document
* */
schema.statics.disabledToDraftDocuments = async function() {
  const DocumentModel = mongoose.model('documents');
  const UserModel = mongoose.model('users');
  const DelPostLogModel = mongoose.model('delPostLog');
  const nkcModules = require('../nkcModules');
  const {article: articleSource, comment: commentSource} = await DocumentModel.getDocumentSources();
  const {faulty: faultyStatus, disabled: disabledStatus} = await DocumentModel.getDocumentStatus();
  const {stable: stableType} = await DocumentModel.getDocumentTypes();
  const match = {
    delType: faultyStatus,
    postType: {$in: [articleSource, commentSource]},
    modifyType: false,
    toc: {
      $lte: Date.now() - 3 * 24 * 60 * 1000,
    }
  };
  //查找对document的退修记录
  const onLog = await DelPostLogModel.find(match);
  for(const log of onLog) {
    const {postId}= log;
    const document = await DocumentModel.findOne({_id: postId, type: stableType});
    await log.updateOne({
      $set: {
        modifyType: true,
        delType: 'faulty',
      }
    });
    //如果document存在并且状态为退修状态
    if(document && document.status === faultyStatus) {
      //将document的状态改变为封禁状态，函数同时去改变document上层的状态
      await document.setStatus(disabledStatus);
      const delLog = await DelPostLogModel({
        delUserId: document.uid,
        delPostTitle: document?document.title : "",
        reason: '退休超时未处理',
        postType: document.source,
        threadId: document.sid,
        postId: document._id,
        delType: disabledStatus,
        noticeType: true,
      });
      await delLog.save();
      const user = await UserModel.findOnly({uid: document.uid});
      await DocumentModel.insertSystemRecordContent(`${document.source}Blocked`, user, {
        state: {
        },
        data: {
          user: {},
          document,
        },
        nkcModules,
        db: require('./index'),
      });
    }
  }
}

/*
* 替换内容中的at为用户主页链接
* */
schema.methods.renderAtUsers = async function() {
  const DocumentModel = mongoose.model('documents');
  return await DocumentModel.renderAtUsers(this.content, this.atUsers);
}

schema.statics.renderAtUsers = async (content, atUsers) => {
  const {getUrl} = require('../nkcModules/tools');
  const usersObj = {};
  const names = [];
  for(const au of atUsers) {
    const {username, uid} = au;
    usersObj[username] = uid;
    const usernameLC = username.toLowerCase();
    usersObj[usernameLC] = uid;
    names.push(username, usernameLC);
  }
  return content.replace(new RegExp(`@(${names.join('|')})`, 'ig'), (c, v) => {
    let newContent = c;
    const uid = usersObj[v];
    if(uid) {
      const element = cheerio.load(`<a target="_blank"></a>`);
      element('a')
        .attr('href', getUrl('userHome', uid))
        .text(`@${v}`);
      newContent = element('body').html();
    }
    return newContent;
  });
}
module.exports = mongoose.model('documents', schema);
