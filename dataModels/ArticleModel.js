const mongoose = require('../settings/database');
const moment = require('moment');
const tools = require('../nkcModules/tools');
const { subscribeSources } = require('../settings/subscribe');
const { renderHTMLByJSON } = require('../nkcModules/nkcRender/json');
const { articleSources, articleStatus } = require('../settings/article');
const { getJsonStringTextSlice } = require('../nkcModules/json');
const { reviewSources } = require('../settings/review');

const schema = new mongoose.Schema(
  {
    _id: String,
    // 文章创建时间
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    // 文章最后修改时间
    tlm: {
      type: Date,
      default: null,
      index: 1,
    },
    // 发表人
    uid: {
      type: String,
      required: true,
      index: 1,
    },
    // document did
    did: {
      type: Number,
      default: null,
      index: 1,
    },
    //是否加精
    digest: {
      type: Boolean,
      default: false,
      index: 1,
    },
    //加精时间
    digestTime: {
      type: Date,
      default: null,
      index: 1,
    },
    // 文章状态
    // normal: 正常的（已发布，未被删除）
    // default: 未发布的（正在编辑，待发布）
    // deleted: 被删除的（已发布，但被删除了）
    // cancelled: 被取消发表的（未发布过，在草稿箱被删除）
    // disabled: 被禁用的（已发布但被管理员禁用了）
    // faulty: 被退修的 （已发布但被管理员退修了）
    // unknown: 状态位置的 （已发布未审核
    status: {
      type: String,
      default: articleStatus.default,
      index: 1,
    },
    // 当前文章是否包含草稿
    hasDraft: {
      type: Boolean,
      default: true,
      index: 1,
    },
    // 引用文章的模块类型
    source: {
      type: String, // column, zone
      required: true,
      index: 1,
    },
    // 引用文章的模块类型所对应的 ID
    sid: {
      type: String,
      default: '',
      index: 1,
    },
    // 文章阅读量
    hits: {
      type: Number,
      default: 0,
    },
    // 支持数
    voteUp: {
      type: Number,
      default: 0,
    },
    // 反对数
    voteDown: {
      type: Number,
      default: 0,
    },
    // 评论数
    comment: {
      type: Number,
      default: 0,
    },
    // 其他引用模块类型
    references: {
      type: [String],
      default: [],
      index: 1,
    },
    // 多维分类ID
    tcId: {
      type: [Number],
      default: [],
      index: 1,
    },
  },
  {
    collection: 'articles',
    toObject: {
      getters: true,
      virtuals: true,
    },
  },
);

schema
  .virtual('user')
  .get(function () {
    return this._user;
  })
  .set(function (user) {
    this._user = user;
  });

schema
  .virtual('content')
  .get(function () {
    return this._content;
  })
  .set(function (content) {
    this._content = content;
  });

schema
  .virtual('url')
  .get(function () {
    return this._url;
  })
  .set(function (url) {
    this._url = url;
  });

/*
 * 获取 status
 * */
schema.statics.getArticleStatus = async () => {
  return articleStatus;
};

/*
 * 改变article的status
 * @param {String} status 需要改变的状态
 * */
schema.methods.changeStatus = async function (status) {
  const ArticleModel = mongoose.model('articles');
  const articleStatus = await ArticleModel.getArticleStatus();
  if (!articleStatus[status]) {
    throw (400, `不存在状态 ${status}`);
  }
  await this.updateOne({
    $set: {
      status,
    },
  });
};

/*
 *
 * 根据did来设置article的status
 * @param {string} did 片段的did
 * @param {string} status 需要设置的状态
 * */
schema.statics.setStatus = async function (did, status) {
  const ArticleModel = mongoose.model('articles');
  const article = await ArticleModel.findOnly({ did });
  await article.updateOne({
    $set: {
      status,
    },
  });
};

/*
 * 获取 source
 * */
schema.statics.getArticleSources = async () => {
  return articleSources;
};

/*
 * 检验 status 是否合法
 * @param {String} status 状态
 * */
schema.statics.checkArticleStatus = async (status) => {
  const ArticleModel = mongoose.model('articles');
  const articleStatus = await ArticleModel.getArticleStatus();
  if (!Object.values(articleStatus).includes(status)) {
    throwErr(500, `article status error. status=${status}`);
  }
};
/*
 * 检验 source 是否合法
 * @param {String} source 来源
 * */
schema.statics.checkArticleSource = async (source) => {
  const ArticleModel = mongoose.model('articles');
  const articleSources = await ArticleModel.getArticleSources();
  if (!Object.values(articleSources).includes(source)) {
    throwErr(500, `article source error. source=${source}`);
  }
};
/*
 *  根据 文章id 查找文章 包括 article docuemnt documentResource
 */
schema.statics.getDocumentInfoById = async (_id) => {
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const { getOriginLevel } = require('../nkcModules/apiFunction');
  let articleInfo = await ArticleModel.findOne({ _id });
  articleInfo = articleInfo.toObject();
  articleInfo.url = `/z/a/${_id}`;
  if (!articleInfo) {
    throwErr(500, '未查找到对应文章');
  }
  let document = await DocumentModel.getStableArticleById(_id);
  const documentResourceId = await document.getResourceReferenceId();
  if (document.origin !== 0) {
    const originDesc = await getOriginLevel(document.origin);
    document = { ...document.toObject(), originDesc };
  } else {
    document = document.toObject();
  }
  return { articleInfo, document, documentResourceId };
};

/*
@param{object} filterData 过滤的数据
@param{array} allowKey filterData保留的key

*/
schema.statics.filterData = (filterData, allowKey) => {
  //
  if (!filterData) {
    return {};
  }
  const { timeFormat } = require('../nkcModules/tools');
  let newObj = {};
  for (const key in filterData) {
    if (Object.hasOwnProperty.call(filterData, key)) {
      if (allowKey.includes(key)) {
        if (key === 'toc' || key === 'tlm' || key === 'dt') {
          newObj[key] = timeFormat(filterData[key]);
          continue;
        }
        newObj[key] = filterData[key];
      }
    }
  }
  return newObj;
};
/*
 * 获取空间文章显示的内容
 * @param {String} id 文章article id
 */
schema.statics.getZoneArticle = async (id, targetUser) => {
  const nkcRender = require('../nkcModules/nkcRender');
  const UserModel = mongoose.model('users');
  const ArticleModel = mongoose.model('articles');
  const ResourceModel = mongoose.model('resources');
  // const DocumentModel = mongoose.model('documents');
  let article = await ArticleModel.findOnly({ _id: id });
  article = (await ArticleModel.getArticlesInfo([article]))[0];
  const { articleInfo, document, documentResourceId } =
    await ArticleModel.getDocumentInfoById(id);
  const documentAllowKey = [
    'title',
    'originDesc',
    'content',
    'abstract',
    'abstractEN',
    'keywords',
    'keywordsEN',
    'authorInfos',
    'toc',
    'origin',
    'uid',
    'collectedCount',
    'tlm',
    'dt',
    'l',
  ];
  // 返回需要的数据
  const filteredDocument = await ArticleModel.filterData(
    document,
    documentAllowKey,
  );
  // 统一key
  const documentContent = await ArticleModel.changeKey(filteredDocument);
  let user = await UserModel.findOne({ uid: articleInfo.uid });
  user = user.toObject();
  let resources = await ResourceModel.getResourcesByReference(
    documentResourceId,
  );
  documentContent.c =
    documentContent.l === 'json'
      ? renderHTMLByJSON({
          json: documentContent.c,
          resources,
          atUsers: document.atUsers,
          xsf: targetUser ? targetUser.xsf : 0,
        })
      : nkcRender.renderHTML({
          type: 'article',
          post: {
            c: documentContent.c,
            resources,
            atUsers: document.atUsers,
          },
          user: targetUser,
        });
  return {
    docNumber: `D${document.did}`,
    post: documentContent,
    userAvatar: user.avatar,
    thread: articleInfo,
    column: {},
    mainCategory: [],
    auxiliaryCategory: [],
    user,
    article,
    type: 'article',
    collectedCount: await ArticleModel.getCollectedCountByAid(id),
  };
};
/*
 * 修改为文章(/columns/article/article.pug)指定的字段
 * param {ObJect} content 文章正文数据
 */
schema.statics.changeKey = async (content) => {
  let changeKeyPost = {};
  const map = {
    title: 't',
    content: 'c',
    c: 'c',
    abstract: 'abstractCn',
    abstractEN: 'abstractEn',
    keywords: 'keyWordsCn',
    keywordsEN: 'keyWordsEn',
    authorInfos: 'authorInfos',
    toc: 'toc',
    origin: 'originState',
    originDesc: 'originDesc',
    uid: 'uid',
    collectedCount: 'collectedCount',
    tlm: 'tlm',
    dt: 'dt',
    l: 'l',
  };
  for (const key in content) {
    if (Object.hasOwnProperty.call(content, key)) {
      changeKeyPost[map[key]] = content[key];
    }
  }
  return changeKeyPost;
};
/*
 * 获取新的 article id
 * @return {String}
 * */
schema.statics.getNewId = async () => {
  const ArticleModel = mongoose.model('articles');
  const { redLock } = require('../nkcModules/redLock');
  const getRedisKeys = require('../nkcModules/getRedisKeys');
  const { getRandomString } = require('../nkcModules/apiFunction');
  const key = getRedisKeys('newArticleId');
  let newId = '';
  let n = 10;
  const lock = await redLock.lock(key, 10000);
  try {
    while (true) {
      n = n - 1;
      const _id = getRandomString('a0', 6);
      const article = await ArticleModel.findOne(
        {
          _id,
        },
        {
          _id: 1,
        },
      );
      if (!article) {
        newId = _id;
        break;
      }
      if (n === 0) {
        break;
      }
    }
  } catch (err) {}
  await lock.unlock();
  if (!newId) {
    throwErr(500, `article id error`);
  }
  return newId;
};

/*
 * 获取指定 文章 id 和作者 id 的文章
 * @param {String} aid 文章 ID
 * @param {String} uid 作者 ID
 * @return {Object} article 对象
 * */
schema.statics.getArticleByIdAndUid = async (aid, uid) => {
  const ArticleModel = mongoose.model('articles');
  return await ArticleModel.findOnly({ _id: aid, uid });
};

/*
 * 向 book 中添加文章，创建 article、document
 * @param {Object} props
 *   @param {String} title 文章标题，可为空
 *   @param {String} content 文章富文本内容，可为空
 *   @param {String} uid 作者，不可为空
 *   @param {File} coverFile 新的封面图文件对象
 *   @param {String} keywords 关键字中文
 *   @param {String} keywordsEN 英文关键字
 *   @param {String} abstract 摘要中文
 *   @param {String} abstractEN 摘要英文
 *   @param {Boolean} origin 是否原创
 * @return {Object} 创建的 article 对象
 * */
schema.statics.createArticle = async (props) => {
  const {
    ip,
    port,
    uid,
    title,
    content,
    coverFile,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin,
    source,
    sid,
    authorInfos,
    tcId,
    l = 'json',
  } = props;
  const toc = new Date();
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const { article: documentSource } = await DocumentModel.getDocumentSources();
  const aid = await ArticleModel.getNewId();
  const { default: defaultStatus } = await ArticleModel.getArticleStatus();
  const document = await DocumentModel.createBetaDocument({
    ip,
    port,
    uid,
    coverFile,
    title,
    content,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin,
    toc,
    source: documentSource,
    sid: aid,
    authorInfos,
    l,
  });
  const article = new ArticleModel({
    _id: aid,
    uid,
    toc,
    did: document.did,
    source,
    sid,
    status: defaultStatus,
    tcId,
  });
  await article.save();
  return article;
};
/*
 * 获取编辑版封面图ID
 * @return {String}
 * */
schema.methods.getBetaDocumentCoverId = async function () {
  const DocumentModel = mongoose.model('documents');
  const { article: documentSource } = await DocumentModel.getDocumentSources();
  const betaDocument = await DocumentModel.getBetaDocumentBySource(
    documentSource,
    this._id,
  );
  return betaDocument ? betaDocument.cover : '';
};

/*
 * 获取正式版封面图ID
 * @return {String}
 * */
schema.methods.getStableDocumentCoverId = async function () {
  const DocumentModel = mongoose.model('documents');
  const { article: documentSource } = await DocumentModel.getDocumentSources();
  const stableDocument = await DocumentModel.getStableDocumentBySource(
    documentSource,
    this._id,
  );
  return stableDocument ? stableDocument.cover : '';
};

/*
 * 删除文章的草稿
 * */
schema.methods.deleteDraft = async function () {
  const DocumentModel = mongoose.model('documents');
  const ArticleModel = mongoose.model('articles');
  const { _id: articleId, status } = this;
  const { article: articleSource } = await DocumentModel.getDocumentSources();
  const { cancelled: cancelledStatus, default: defaultStatus } =
    await ArticleModel.getArticleStatus();
  // 如果是未发布过的文章，则需要将文章状态改为 cancelled（取消发表）
  if (status === defaultStatus) {
    await this.updateOne({
      $set: {
        status: cancelledStatus,
        hasDraft: false,
        tlm: new Date(),
      },
    });
  }

  await DocumentModel.setBetaDocumentAsHistoryBySource(
    articleSource,
    articleId,
  );
  await this.changeHasDraftStatus();
};

/*
 * 删除文章的投稿申请
 * */
schema.methods.deleteColumnContribute = async function () {
  const ColumnContributeModel = mongoose.model('columnContributes');
  const { _id: articleId } = this;
  // 以文章id为条件在columnContribute中查找在各个column中最新的一条申请
  const latestContributeInColumn = await ColumnContributeModel.aggregate([
    {
      $match: { tid: articleId, source: 'article' }, // 匹配条件，根据 tid 进行筛选
    },
    {
      $sort: { toc: -1 }, // 根据 toc 字段降序排序
    },
    {
      $group: {
        _id: '$columnId', // 按 columnId 分组
        latestContributions: { $first: '$$ROOT' }, // 获取每个分组中的第一条记录，即最新的一条申请
      },
    },
    {
      $replaceRoot: { newRoot: '$latestContributions' }, // 将每个分组中的记录作为新的根文档
    },
  ]);
  for (const contribute of latestContributeInColumn) {
    if (
      (contribute.passed === 'pending' || contribute.passed === 'unknown') &&
      contribute.type === 'submit'
    ) {
      // 最新的一条申请是审核中的投稿则改变此条申请状态
      await ColumnContributeModel.updateOne(
        { _id: contribute._id },
        { $set: { passed: 'cancel' } },
      );
    }
  }
};
/*
 * 刪除文章
 * */
schema.methods.deleteArticle = async function () {
  const ArticleModel = mongoose.model('articles');
  const ColumnPostModel = mongoose.model('columnPosts');
  const DocumentModel = mongoose.model('documents');
  const { normal: normalStatus, deleted: deletedStatus } =
    await ArticleModel.getArticleStatus();
  const { column: columnSource, zone: zoneSource } =
    await ArticleModel.getArticleSources();
  const { status, source, _id } = this;
  // if(status !== normalStatus) {
  //   throwErr(500, `文章状态异常 status=${this.status}`);
  // }
  // 删除草稿
  await this.deleteDraft();
  //根据文章id删除引用
  if (source === columnSource) {
    await this.deleteColumnContribute();
    await ColumnPostModel.deleteColumnPost(_id);
  }
  const { article: articleSource } = await DocumentModel.getDocumentSources();
  const { disabled: disabledStatus, deleted: deletedDocStatus } =
    await DocumentModel.getDocumentStatus();
  const { stable: stableType } = await DocumentModel.getDocumentTypes();
  const document = await DocumentModel.findOne({
    sid: _id,
    source: articleSource,
    type: stableType,
  });
  if (document) {
    await document.updateOne({
      $set: {
        status: deletedDocStatus,
      },
    });
  }
  // 删除文章
  this.status = deletedStatus;
  await this.updateOne({
    $set: {
      status: this.status,
    },
  });
};

/*
 * 删除文章引用
 * */
schema.methods.deleteReferences = async function () {
  const { source, sid, references } = this;
  const ArticleModel = mongoose.model('articles');
  const { column: columnSource } = await ArticleModel.getArticleSources();
  if (source === columnSource) {
  }
};
/*
 * 删除文章并删除文章引用
 * */
schema.methods.deleteArticleAndReferences = async function () {
  await this.deleteArticle();
  await this.deleteReferences();
};

/*
 * 修改article
 * @param {Object} props
 *   @param {String} title 文章标题，可为空
 *   @param {String} content 文章内容，可为空
 *   @param {String} cover 原封面 ID，可为空
 *   @param {File} coverFile 新的封面图文件对象
 *   @param {String} keywords 关键字中文
 *   @param {String} keywordsEN 英文关键字
 *   @param {String} abstract 摘要中文
 *   @param {String} abstractEN 摘要英文
 *   @param {Boolean} origin 是否原创
 *   @param {Array} authorInfos 作者信息
 * */
schema.methods.modifyArticle = async function (props) {
  const DocumentModel = mongoose.model('documents');
  const {
    title,
    content,
    coverFile,
    cover,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin,
    authorInfos,
  } = props;
  const { did } = this;
  const toc = new Date();
  //更改document
  await DocumentModel.updateDocumentByDid(did, {
    title,
    content,
    cover,
    coverFile,
    keywords,
    keywordsEN,
    abstract,
    abstractEN,
    origin,
    authorInfos,
    tlm: toc,
  });
};
/*
 * 发布 article
 * 如果有正式版就将正式版设为历史
 * 将测试版设为正式版
 * */
schema.methods.publishArticle = async function (options) {
  const ArticleModel = mongoose.model('articles');
  const ColumnPostModel = mongoose.model('columnPosts');
  const MomentModel = mongoose.model('moments');
  const { normal } = await ArticleModel.getArticleStatus();
  const { article: articleQuoteType } = await MomentModel.getMomentQuoteTypes();
  const { article: articleType } = await ColumnPostModel.getColumnPostTypes();
  const { source, selectCategory } = options;
  const DocumentModel = mongoose.model('documents');
  const { did, uid, _id: articleId } = this;
  const {
    publishPermissionService,
  } = require('../services/publish/publishPermission.service');
  const { publishPermissionTypes } = require('../settings/serverSettings');
  const articleSources = await ArticleModel.getArticleSources();
  //检测当前用户的发表权限
  await publishPermissionService.checkPublishPermission(
    publishPermissionTypes.article,
    this.uid,
  );
  let columnPost;
  let articleUrl;

  const { article: documentSource } = await DocumentModel.getDocumentSources();
  const { normal: normalStatus } = await ArticleModel.getArticleStatus();
  const stableDocument = await DocumentModel.getStableDocumentBySource(
    documentSource,
    articleId,
  );
  const isModify = !!stableDocument;

  if (source === articleSources.column) {
    //如果发表专栏的文章就将创建文章专栏分类引用记录 先查找是否存在引用，如果没有就创建一条新的引用
    columnPost = await ColumnPostModel.findOne({
      pid: articleId,
      type: articleType,
    });
    if (!columnPost) {
      columnPost = await ColumnPostModel.createColumnPost(this, selectCategory);
    }
    articleUrl = `/m/${columnPost.columnId}/a/${columnPost._id}`;
  } else if (source === articleSources.zone) {
    /*await this.updateOne({
          $set: {
            sid: momentId,
          }
        });*/
    articleUrl = `/z/a/${articleId}`;
  }

  //更新文章的最后修改时间
  await this.updateOne({
    $set: {
      tlm: new Date(),
    },
  });
  await DocumentModel.publishDocumentByDid(did);
  const newArticle = await ArticleModel.findOnly({ _id: this._id });
  //如果发布的article不需要审核，并且不存在该文章的动态时就为该文章创建一条新的动态
  //不需要审核的文章状态不为默认状态
  if (!isModify && newArticle.status === normalStatus) {
    // 获取IP
    const { ip, port } = await this.getIpAndPort();
    MomentModel.createQuoteMomentAndPublish({
      ip,
      port,
      uid,
      quoteType: articleQuoteType,
      quoteId: articleId,
    }).catch(console.error);
  }

  return articleUrl;
};
/*
 * 发布 article 为独立文章可以不选择专栏信息
 * */
schema.methods.submitArticle = async function (options) {
  const ArticleModel = mongoose.model('articles');
  const ColumnPostModel = mongoose.model('columnPosts');
  const ColumnModel = mongoose.model('columns');
  const MomentModel = mongoose.model('moments');
  const ColumnContributeModel = mongoose.model('columnContributes');
  const SettingModel = mongoose.model('settings');
  const { article: articleQuoteType } = await MomentModel.getMomentQuoteTypes();
  const { article: articleType } = await ColumnPostModel.getColumnPostTypes();
  const { sid, selectCategory, reviewPermission } = options;
  const DocumentModel = mongoose.model('documents');
  const { did, uid, _id: articleId } = this;
  const {
    publishPermissionService,
  } = require('../services/publish/publishPermission.service');
  const { publishPermissionTypes } = require('../settings/serverSettings');
  //检测当前用户的发表权限
  await publishPermissionService.checkPublishPermission(
    publishPermissionTypes.article,
    this.uid,
  );
  let articleUrl;
  const { article: documentSource } = await DocumentModel.getDocumentSources();
  const { normal: normalStatus } = await ArticleModel.getArticleStatus();
  const stableDocument = await DocumentModel.getStableDocumentBySource(
    documentSource,
    articleId,
  );
  const isModify = !!stableDocument;
  //更新文章的最后修改时间
  await this.updateOne({
    $set: {
      tlm: new Date(),
    },
  });
  const { checkString } = require('../nkcModules/checkData');
  const { stable, beta } = await DocumentModel.getDocumentTypes();
  const type = [stable, beta];
  const documentsObj = {};
  const documents = await DocumentModel.find({
    did,
    type: { $in: type },
  });
  for (const d of documents) {
    documentsObj[d.type] = d;
  }
  if (!documentsObj.beta) {
    ThrowCommonError(400, `不存在编辑版`);
  }
  //判断专栏文章编辑版是否填写标题
  if (documentsObj.beta.source === 'column') {
    checkString(documentsObj.beta.source, {
      name: '文章标题',
      minTextLength: 1,
      maxLength: 500,
    });
  }
  //如果存在正式版就将正式版变为正式历史版，更新修改时间
  if (documentsObj.stable) {
    await documentsObj.stable.setAsHistoryDocument();
  }
  await documentsObj.beta.updateOne({
    $set: {
      type: type[0],
      tlm: documentsObj.stable ? new Date() : null,
    },
  });
  //是否需要审核
  let needReview = await documentsObj.beta.getReviewStatusAndCreateReviewLog();
  if (reviewPermission) {
    needReview = false;
  }
  if (needReview) {
    await documentsObj.beta.setStatus(
      (
        await DocumentModel.getDocumentStatus()
      ).unknown,
    );
    if (sid && selectCategory) {
      // 有选择专栏==》创建一条投稿记录
      let contribute = await ColumnContributeModel.findOne({
        columnId: sid,
        tid: this._id,
        source: 'article',
        type: 'submit',
        passed: {
          $in: ['unknown', 'pending', 'resolve'],
        },
      });
      if (!contribute) {
        contribute = ColumnContributeModel({
          _id: await SettingModel.operateSystemID('columnContributes', 1),
          uid: this.uid,
          tid: this._id,
          pid: '',
          cid: selectCategory.selectedMainCategoriesId,
          mcid: selectCategory.selectedMinorCategoriesId,
          description: '',
          columnId: sid,
          source: 'article',
          passed: 'unknown',
          type: 'submit',
        });
        await contribute.save();
      }
    }
  } else {
    //不需要审核
    await documentsObj.beta.setStatus(
      (
        await DocumentModel.getDocumentStatus()
      ).normal,
    );
    if (sid && selectCategory) {
      // 有选择专栏
      // 是否具有专栏管理员添加文章权限或者专栏主
      // 获取专栏的基本信息。。与用户的信息进行对比
      const column = await ColumnModel.findOnly({ _id: sid });
      const userPermissionObject =
        await ColumnModel.getUsersPermissionKeyObject();
      const isPermission = await ColumnModel.checkUsersPermission(
        column.users,
        this.uid,
        userPermissionObject.column_post_add,
      );
      if (isPermission || column.uid === this.uid) {
        let contribute = await ColumnContributeModel.findOne({
          columnId: column._id,
          tid: this._id,
          source: 'article',
          type: 'submit',
          passed: {
            $in: ['pending', 'resolve'],
          },
        });
        if (!contribute) {
          contribute = ColumnContributeModel({
            _id: await SettingModel.operateSystemID('columnContributes', 1),
            uid: this.uid,
            tid: this._id,
            pid: '',
            cid: selectCategory.selectedMainCategoriesId,
            mcid: selectCategory.selectedMinorCategoriesId,
            description: '具有专栏添加文章权限',
            columnId: column._id,
            source: 'article',
            passed: 'resolve',
            type: 'submit',
          });
          await contribute.save();
        }
        let columnPost = await ColumnPostModel.findOne({
          pid: this._id,
          type: articleType,
          columnId: column._id,
        });
        if (!columnPost) {
          columnPost = await ColumnPostModel.createColumnPost(
            this,
            selectCategory,
          );
        }
        // 需要进行更新article中sid
        let sidArray = [];
        const columnPostArray = await ColumnPostModel.find({
          pid: this._id,
          type: 'article',
        });
        for (const columnPostItem of columnPostArray) {
          sidArray.push(columnPostItem.columnId);
        }
        sidArray = [...new Set(sidArray)];
        // const sidArray = this.sid.split('-').filter(item=>!!item&&item!==String(sid));
        // sidArray.push(sid);
        await ArticleModel.updateOne(
          { _id: this._id },
          { $set: { sid: sidArray.join('-') } },
        );
        await documentsObj.beta.sendMessageToAtUsers('article');
        articleUrl = `/m/${columnPost.columnId}/a/${columnPost._id}`;
      } else {
        let contribute = await ColumnContributeModel.findOne({
          columnId: column._id,
          tid: this._id,
          source: 'article',
          type: 'submit',
          passed: {
            $in: ['pending', 'resolve'],
          },
        });
        if (!contribute) {
          contribute = ColumnContributeModel({
            _id: await SettingModel.operateSystemID('columnContributes', 1),
            uid: this.uid,
            tid: this._id,
            pid: '',
            cid: selectCategory.selectedMainCategoriesId,
            mcid: selectCategory.selectedMinorCategoriesId,
            description: '',
            columnId: column._id,
            source: 'article',
            passed: 'pending',
            type: 'submit',
          });
          await contribute.save();
        }
      }
    }
    // await documentsObj.beta.sendMessageToAtUsers('article');
  }
  //同步到search数据库
  await documentsObj.beta.pushToSearchDB();
  const newArticle = await ArticleModel.findOnly({ _id: this._id });
  // 如果发布的article不需要审核，并且不存在该文章的动态时就为该文章创建一条新的动态
  // 不需要审核的文章状态不为默认状态
  if (!isModify && newArticle.status === normalStatus) {
    // 获取IP
    const { ip, port } = await this.getIpAndPort();
    MomentModel.createQuoteMomentAndPublish({
      ip,
      port,
      uid,
      quoteType: articleQuoteType,
      quoteId: articleId,
    }).catch(console.error);
  }

  return articleUrl || `/z/a/${articleId}`;
};

schema.methods.getIpAndPort = async function () {
  const DocumentModel = mongoose.model('documents');
  const IPModel = mongoose.model('ips');
  const sources = await DocumentModel.getDocumentSources();
  const document = await DocumentModel.getStableDocumentBySource(
    sources.article,
    this._id,
  );
  const ipId = document.ip;
  const ip = await IPModel.getIpByIpId(ipId);
  return {
    ip,
    port: document.port,
  };
};

schema.methods.getStableDocId = async function () {
  const { did } = this;
  const DocumentModel = mongoose.model('documents');
  const document = await DocumentModel.findOne({
    did,
    type: 'stable',
  });
  return document ? document._id : null;
};

schema.methods.getNote = async function () {
  const NoteModel = mongoose.model('notes');
  const stableDocId = await this.getStableDocId();
  return {
    type: 'document',
    targetId: stableDocId,
    notes: await NoteModel.getNotesByDocId(stableDocId),
  };
};
/*
 * 保存 article
 * 将测试版变为测试历史版 betaHistory
 * */
schema.methods.autoSaveArticle = async function () {
  const DocumentModel = mongoose.model('documents');
  const { article: documentSource } = await DocumentModel.getDocumentSources();
  //将测试版变为测试历史版
  await DocumentModel.checkContentAndCopyBetaToHistoryBySource(
    documentSource,
    this._id,
  );
};
schema.methods.saveArticle = async function () {
  const DocumentModel = mongoose.model('documents');
  const { article: documentSource } = await DocumentModel.getDocumentSources();
  //将测试版变为测试历史版
  await DocumentModel.copyBetaToHistoryBySource(documentSource, this._id);
};
schema.statics.checkArticleInfo = async (article) => {
  const { title, content } = article;
  const { checkString } = require('../nkcModules/checkData');
  checkString(title, {
    name: '文章标题',
    minTextLength: 1,
    maxLength: 500,
  });
  checkString(content, {
    name: '文章内容',
    maxLength: 200000,
    minTextLength: 1,
    maxTextLength: 10000,
  });
};

schema.methods.getEditorBetaDocumentContent = async function () {
  const DocumentModel = mongoose.model('documents');
  const { article: documentSource } = await DocumentModel.getDocumentSources();
  return DocumentModel.getEditorBetaDocumentContentBySource(
    documentSource,
    this._id,
  );
};

/*
 * 拓展articles
 * */
schema.statics.extendArticles = async function (articles) {
  const ArticleModel = mongoose.model('articles');
  const ColumnPostModel = mongoose.model('columnPosts');
  const DocumentModel = mongoose.model('documents');
  const { article: documentSource } = await DocumentModel.getDocumentSources();
  const articleSource = await ArticleModel.getArticleSources();
  const { timeFormat, getUrl } = require('../nkcModules/tools');
  const articlesId = [];
  const columnPostArr = [];
  const columnPostObj = {};
  for (const article of articles) {
    articlesId.push(article._id);
    if (article.source === articleSource.column) {
      columnPostArr.push(article._id);
    }
  }
  const { article: articleType } = await ColumnPostModel.getColumnPostTypes();
  //查找出独立文章所在的专栏
  const columnPosts = await ColumnPostModel.find({
    pid: { $in: columnPostArr },
    type: articleType,
  });
  for (const columnPost of columnPosts) {
    columnPostObj[columnPost.pid] = columnPost;
  }
  //根据article查找出独立文章下的内容
  const documents = await DocumentModel.find({
    type: {
      $in: ['beta', 'stable'],
    },
    source: documentSource,
    sid: {
      $in: articlesId,
    },
  });
  const articlesObj = {};
  for (const d of documents) {
    const { type, sid } = d;
    if (!articlesObj[sid]) {
      articlesObj[sid] = {};
    }
    articlesObj[sid][type] = d;
  }
  const results = [];
  for (const article of articles) {
    const { _id, toc, uid } = article;
    const articleObj = articlesObj[_id];
    if (!articleObj) {
      continue;
    }
    const betaDocument = articlesObj[_id].beta;
    const stableDocument = articlesObj[_id].stable;
    if (!stableDocument && !betaDocument) {
      continue;
    }
    const document = stableDocument || betaDocument;
    const { title, did } = document;
    let columnPost;
    if (article.source === articleSource.column) {
      columnPost = columnPostObj[article._id];
    }
    let url;
    if (article.source === articleSource.column) {
      if (columnPost) {
        url = `/m/${columnPostObj[_id].columnId}/a/${columnPostObj[_id]._id}`;
      } else {
        url = `/article/${article._id}`;
      }
    } else if (article.source === articleSource.zone) {
      url = `/z/a/${article._id}`;
    }
    const result = {
      _id,
      uid,
      published: !!stableDocument,
      hasBeta: !!betaDocument,
      title: title || '未填写标题',
      url,
      time: timeFormat(toc),
      did,
      source: article.source,
    };
    results.push(result);
  }
  return results;
};

schema.statics.getBetaDocumentsObjectByArticlesId = async function (
  articlesId,
) {
  const DocumentModel = mongoose.model('documents');
  const { article: articleSource } = await DocumentModel.getDocumentSources();
  const betaDocuments = await DocumentModel.getBetaDocumentsBySource(
    articleSource,
    articlesId,
  );
  const betaDocumentsObj = {};
  for (const document of betaDocuments) {
    betaDocumentsObj[document.sid] = document;
  }
  return betaDocumentsObj;
};

/*
 * 返回文章页链接和编辑器链接
 * @param {String} articleId 文章 ID
 * @param {String} source 文章来源
 * @param {String} sid 文章来源所对应的 ID
 * @return {Object}
 *   @param {String} editorUrl 文章编辑器 url
 *   @param {String} articleUrl 文章的显示页 url
 * */
schema.statics.getArticleUrlBySource = async function (
  articleId,
  source,
  sid,
  status,
) {
  const tools = require('../nkcModules/tools');
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  // 片段创作
  const { draft: fragmentDraft } = await DocumentModel.getDocumentSources();
  const { column: columnSource, zone: zoneSource } =
    await ArticleModel.getArticleSources();
  const { default: defaultStatus } = await ArticleModel.getArticleStatus();
  let editorUrl = '';
  let articleUrl = '';
  if (source === columnSource) {
    if (sid) {
      editorUrl = tools.getUrl('columnArticleEditor', sid, articleId);
    } else {
      editorUrl = '/creation/editor/column?aid=' + articleId;
    }
    const ColumnPostModel = mongoose.model('columnPosts');
    const { article: articleType } = await ColumnPostModel.getColumnPostTypes();
    const columnPost = await ColumnPostModel.findOne(
      { type: articleType, pid: articleId },
      { _id: 1 },
    );
    if (columnPost) {
      articleUrl = tools.getUrl('columnArticle', sid, columnPost._id);
    }
  } else if (source === zoneSource) {
    editorUrl = tools.getUrl('zoneArticleEditor', sid, articleId);
    articleUrl = tools.getUrl('zoneArticle', articleId);
  } else if (source === fragmentDraft) {
    editorUrl = tools.getUrl('draftEditor', sid);
    // articleUrl = tools.getUrl('draftEditor', );
  }

  return {
    editorUrl,
    articleUrl,
  };
};

/*
 * 拓展独立文章列表，用于显示文章列表
 * @param {[Article]}
 * @return {[Object]}
 *   @param {String} articleSource 文章来源
 *   @param {String} articleSourceId 来源 ID
 *   @param {String} articleId 文章 ID
 *   @param {String} articleUrl 文章链接
 *   @param {String} articleEditorUrl 文章编辑器链接
 *   @param {Number} hits 阅读量
 *   @param {Number} voteUp 点赞数
 *   @param {Number} comment 评论数
 *   @param {String} title 文章标题
 *   @param {String} content 文章摘要
 *   @param {String} coverUrl 封面图链接
 *   @param {String} time 格式化之后的文章内容创建时间
 *   @param {String} mTime 格式化之后的文章内容最后修改时间
 *   @param {Object} column
 *     @param {Number} _id 专栏 ID
 *     @param {String} name 专栏名称
 *     @param {String} description 专栏介绍
 *     @param {String} homeUrl 专栏首页链接
 * */
schema.statics.extendArticlesList = async (articles) => {
  const DocumentModel = mongoose.model('documents');
  const ArticleModel = mongoose.model('articles');
  const ColumnModel = mongoose.model('columns');
  const nkcRender = require('../nkcModules/nkcRender');
  const tools = require('../nkcModules/tools');
  const { column: columnSource } = await ArticleModel.getArticleSources();
  const articlesId = [];
  const columnsId = [];
  for (const article of articles) {
    const { _id, source, sid } = article;
    articlesId.push(_id);
    if (source === columnSource) {
      columnsId.push(sid);
    }
  }
  const { article: articleSource } = await DocumentModel.getDocumentSources();
  const stableDocumentsObj = await DocumentModel.getStableDocumentsBySource(
    articleSource,
    articlesId,
    'object',
  );
  const columnsObj = await ColumnModel.getColumnsById(columnsId, 'object');

  const articlesList = [];
  for (const article of articles) {
    const {
      _id: articleId,
      source,
      sid,
      voteUp,
      hits,
      comment,
      status,
    } = article;
    const stableDocument = stableDocumentsObj[articleId];
    if (!stableDocument) {
      continue;
    }
    let column;
    const { articleUrl, editorUrl } = await ArticleModel.getArticleUrlBySource(
      articleId,
      source,
      sid,
      status,
    );
    if (source === columnSource) {
      const targetColumn = columnsObj[sid];
      if (targetColumn) {
        column = {
          _id: targetColumn._id,
          name: targetColumn.name,
          description: targetColumn.description,
          homeUrl: tools.getUrl('columnHome', targetColumn._id),
        };
      }
    }
    articlesList.push({
      status,
      articleSource: source,
      articleSourceId: sid,
      articleId,
      articleUrl,
      articleEditorUrl: editorUrl,
      voteUp,
      hits,
      comment,
      title: stableDocument.title,
      content:
        stableDocument.l === 'json'
          ? getJsonStringTextSlice(stableDocument.content, 200)
          : nkcRender.htmlToPlain(stableDocument.content, 200),
      coverUrl: stableDocument.cover
        ? tools.getUrl('documentCover', stableDocument.cover)
        : '',
      time: moment(stableDocument.toc).format(`YYYY/MM/DD`),
      mTime: tools.fromNow(stableDocument.tlm),
      column,
    });
  }
  return articlesList;
};

/*
 * 拓展独立文章列表，用于显示文章列表
 * @param {[Article]}
 * @return {[Object]}
 *   @param {String} articleSource 文章来源
 *   @param {String} articleSourceId 来源 ID
 *   @param {String} articleId 文章 ID
 *   @param {String} articleUrl 文章链接
 *   @param {String} articleEditorUrl 文章编辑器链接
 *   @param {Number} hits 阅读量
 *   @param {Number} voteUp 点赞数
 *   @param {Number} comment 评论数
 *   @param {String} title 文章标题
 *   @param {String} content 文章摘要
 *   @param {String} coverUrl 封面图链接
 *   @param {String} time 格式化之后的文章内容创建时间
 *   @param {String} mTime 格式化之后的文章内容最后修改时间
 *   @param {Object} column
 *     @param {Number} _id 专栏 ID
 *     @param {String} name 专栏名称
 *     @param {String} description 专栏介绍
 *     @param {String} homeUrl 专栏首页链接
 * */
schema.statics.extendArticlesListWithColumn = async (articles) => {
  const DocumentModel = mongoose.model('documents');
  const ArticleModel = mongoose.model('articles');
  const ColumnModel = mongoose.model('columns');
  const ColumnContributeModel = mongoose.model('columnContributes');
  const ColumnPostModel = mongoose.model('columnPosts');
  const nkcRender = require('../nkcModules/nkcRender');
  const tools = require('../nkcModules/tools');
  const { column: columnSource } = await ArticleModel.getArticleSources();
  const articlesId = [];
  let columnsId = [];
  for (const article of articles) {
    const { _id, source, sid } = article;
    articlesId.push(_id);
    if (source === columnSource && sid) {
      const sidArray = String(sid)
        .split('-')
        .filter((sid) => !!sid && sid !== 'null');
      for (const sidItem of sidArray) {
        columnsId.push(sidItem);
      }
    }
  }
  columnsId = [...new Set(columnsId)];
  const { article: articleSource } = await DocumentModel.getDocumentSources();
  const stableDocumentsObj = await DocumentModel.getStableDocumentsBySource(
    articleSource,
    articlesId,
    'object',
  );
  const columnsObj = await ColumnModel.getColumnsById(columnsId, 'object');

  const articlesList = [];
  for (const article of articles) {
    const {
      _id: articleId,
      source,
      sid,
      voteUp,
      hits,
      comment,
      status,
    } = article;
    const stableDocument = stableDocumentsObj[articleId];
    if (!stableDocument) {
      continue;
    }
    let column = [];
    let contributeColumns = [];
    // const { articleUrl, editorUrl } = await ArticleModel.getArticleUrlBySource(
    //   articleId,
    //   source,
    //   sid,
    //   status,
    // );
    const sidArray = String(sid)
      .split('-')
      .filter((sid) => !!sid);
    for (const sidItem of sidArray) {
      if (source === columnSource) {
        const targetColumn = columnsObj[sidItem];
        if (targetColumn) {
          let passed = '';
          let type = '';
          let inColumnUrl = '';
          const contribute = await ColumnContributeModel.findOne({
            columnId: targetColumn._id,
            tid: articleId,
            source: 'article',
          }).sort({ toc: -1 });
          if (contribute && contribute.type === 'retreat') {
            passed = contribute.passed;
            type = contribute.type;
          }
          const columnPost = await ColumnPostModel.findOne(
            {
              type: 'article',
              pid: articleId,
              columnId: targetColumn._id,
            },
            { _id: 1 },
          );
          if (columnPost) {
            inColumnUrl = tools.getUrl(
              'columnArticle',
              targetColumn._id,
              columnPost._id,
            );
          }
          column.push({
            _id: targetColumn._id,
            name: targetColumn.name,
            description: targetColumn.description,
            homeUrl: tools.getUrl('columnHome', targetColumn._id),
            avatar: targetColumn.avatar,
            abbr: targetColumn.abbr,
            inColumnUrl,
            passed,
            type,
          });
        }
      }
    }
    // 以文章id为条件在columnContribute中查找在各个column中最新的一条申请
    const latestContributeInColumn = await ColumnContributeModel.aggregate([
      {
        $match: { tid: articleId, source: 'article' }, // 匹配条件，根据 tid 进行筛选
      },
      {
        $sort: { toc: -1 }, // 根据 toc 字段降序排序
      },
      {
        $group: {
          _id: '$columnId', // 按 columnId 分组
          latestContributions: { $first: '$$ROOT' }, // 获取每个分组中的第一条记录，即最新的一条申请
        },
      },
      {
        $replaceRoot: { newRoot: '$latestContributions' }, // 将每个分组中的记录作为新的根文档
      },
    ]);
    for (const contribute of latestContributeInColumn) {
      if (contribute.passed === 'pending' && contribute.type === 'submit') {
        // 最新的一条申请是审核中的投稿
        contributeColumns.push(contribute.columnId);
      }
    }
    if (contributeColumns.length > 0) {
      contributeColumns = await ColumnModel.find({
        _id: { $in: [...contributeColumns] },
      });
      contributeColumns = [...contributeColumns].map((item) => ({
        _id: item._id,
        name: item.name,
        description: item.description,
        homeUrl: tools.getUrl('columnHome', item._id),
        avatar: item.avatar,
        abbr: item.abbr,
      }));
    }
    articlesList.push({
      status,
      articleSource: source,
      articleSourceId: sid,
      articleId,
      articleUrl: `/article/${articleId}`,
      articleEditorUrl: `/creation/editor/column?source=column&aid=${articleId}`,
      voteUp,
      hits,
      comment,
      title: stableDocument.title,
      content:
        stableDocument.l === 'json'
          ? getJsonStringTextSlice(stableDocument.content, 200)
          : nkcRender.htmlToPlain(stableDocument.content, 200),
      coverUrl: stableDocument.cover
        ? tools.getUrl('documentCover', stableDocument.cover)
        : '',
      time: moment(stableDocument.toc).format(`YYYY/MM/DD`),
      mTime: tools.fromNow(stableDocument.tlm),
      column,
      contributeColumns,
    });
  }
  return articlesList;
};

/*
 * 拓展独立文章草稿页列表，用于显示文章草稿列表
 * @param {[Article]}
 * @return {[Object]}
 *   @param {String} type 表示草稿类型 create(新写文章) modify(编辑文章)
 *   @param {String} articleId 文章 ID
 *   @param {String} title 文章标题
 *   @param {String} content 文章摘要
 *   @param {String} coverUrl 封面图链接
 *   @param {String} articleUrl 文章链接
 *   @param {String} articleEditorUrl 文章编辑器链接
 *   @param {String} time 格式化之后的文章内容创建时间
 *   @param {String} mTime 格式化之后的文章内容最后修改时间
 *   @param {Object} column
 *     @param {Number} _id 专栏 ID
 *     @param {String} name 专栏名称
 *     @param {String} description 专栏介绍
 *     @param {String} homeUrl 专栏首页链接
 * */
schema.statics.extendArticlesDraftList = async (articles) => {
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const ColumnModel = mongoose.model('columns');
  const nkcRender = require('../nkcModules/nkcRender');
  const tools = require('../nkcModules/tools');
  const { column: columnSource } = await ArticleModel.getArticleSources();
  const { article: articleSource } = await DocumentModel.getDocumentSources();
  const articlesId = [];
  const columnsId = [];
  for (const article of articles) {
    if (article.source === columnSource && article.sid) {
      // columnsId.push(article.sid);
      columnsId.concat([...article.sid.split('-')]);
    }
    articlesId.push(article._id);
  }
  const betaDocumentsObject = await DocumentModel.getBetaDocumentsBySource(
    articleSource,
    articlesId,
    'object',
  );
  const columnsObj = await ColumnModel.getColumnsById(columnsId, 'object');
  const results = [];
  for (const article of articles) {
    const betaDocument = betaDocumentsObject[article._id];
    if (!betaDocument) {
      continue;
    }
    let column;
    if (article.source === columnSource && article.sid) {
      const targetColumn = columnsObj[article.sid.split('-')[0]];
      if (targetColumn) {
        column = {
          _id: targetColumn._id,
          name: targetColumn.name,
          description: targetColumn.description,
          homeUrl: tools.getUrl('columnHome', targetColumn._id),
        };
      }
    }
    const { title, content, toc, tlm, cover, l } = betaDocument;
    const { _id: articleId, status, source, sid } = article;
    let articleUrl = '',
      editorUrl = '';
    if (source === columnSource) {
      articleUrl = `/article/${articleId}`;
      editorUrl = `/creation/editor/column?source=column&aid=${articleId}`;
    } else {
      const Url = await ArticleModel.getArticleUrlBySource(
        articleId,
        source,
        sid,
      );
      articleUrl = Url.articleUrl;
      editorUrl = Url.editorUrl;
    }
    results.push({
      type: status === 'default' ? 'create' : 'modify',
      articleId,
      title: title || '未填写',
      content:
        l === 'json'
          ? getJsonStringTextSlice(content, 200)
          : nkcRender.htmlToPlain(content, 200),
      coverUrl: cover ? tools.getUrl('documentCover', cover) : '',
      articleUrl,
      articleEditorUrl: editorUrl,
      column,
      time: tools.timeFormat(toc),
      mTime: tools.fromNow(tlm),
    });
  }
  return results;
};

/*
 * 更改article的hasDraft字段状态
 * @param {Boolean} type 要改变的状态
 * */
schema.methods.changeHasDraftStatus = async function () {
  const DocumentModel = mongoose.model('documents');
  const { article } = await DocumentModel.getDocumentSources();
  const { beta } = await DocumentModel.getDocumentTypes();
  const count = await DocumentModel.countDocuments({
    sid: this._id,
    source: article,
    type: beta,
  });
  this.hasDraft = count > 0;
  await this.updateOne({
    $set: {
      hasDraft: this.hasDraft,
    },
  });
};

/*
 * 拓展article下的document
 * @param {Object} articles 需要拓展document的article
 * @param {string} type 需要拓展的类型 stable beta
 * @param {Array} options article需要拓展document的内容
 * document: [
 *   _id,
 *   title,
 *   content,
 *   uid,
 *   cover,
 *   keywordsEN,
 *   keywords,
 *   abstractEN,
 *   abstract,
 *   reviewed,
 *   wordCount,
 *   ip,
 *   port,
 *   did,
 *   toc,
 *   type，
 *   source,
 * ]
 * */
schema.statics.extendDocumentsOfArticles = async function (
  articles,
  type = 'beta',
  options,
) {
  const DocumentModel = mongoose.model('documents');
  const arr = [];
  const obj = {};
  const _articles = [];
  for (const article of articles) {
    if (article.type === 'deletes') {
      continue;
    }
    arr.push(article.did);
  }
  const documentType = await DocumentModel.getDocumentTypes();
  const { article } = await DocumentModel.getDocumentSources();
  const documents = await DocumentModel.find({
    did: { $in: arr },
    type: documentType[type],
    source: article,
  });
  for (const document of documents) {
    const a = {};
    for (const t of options) {
      a[t] = document[t];
    }
    obj[document.did] = a;
  }
  for (const article of articles) {
    const { _id, did, toc, status, hasDraft, sid, uid, source } = article;
    const document = obj[article.did];
    if (!document) {
      continue;
    }
    _articles.push({
      _id,
      did,
      toc,
      status,
      hasDraft,
      sid,
      uid,
      source,
      document,
    });
  }
  return _articles;
};

/*
 * 获取当前用户的专家权限
 * */
schema.methods.isModerator = async function (uid) {
  return this.isAuthor(uid);
};

/*
 * 判断uid是否为文章作者
 * */
schema.methods.isAuthor = async function (uid) {
  return this.uid === uid;
};

/*
 * 获取article文章的信息
 * @param {object} articles 需要拓展信息的文章article
 * res： {
 *   articles: [
 *     {
 *       article, 原article
 *       url, 文章链接地址
 *       editorUrl， 文章编辑地址
 *       user, 文章的用户信息
 *       replies, 文章回复数
 * }]}
 * */
schema.statics.getArticlesInfo = async function (articles) {
  const UserModel = mongoose.model('users');
  const ColumnPostModel = mongoose.model('columnPosts');
  const ColumnModel = mongoose.model('columns');
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const ArticlePostModel = mongoose.model('articlePosts');
  const DelPostLogModel = mongoose.model('delPostLog');
  const SettingModel = mongoose.model('settings');
  const XsfsRecordModel = mongoose.model('xsfsRecords');
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const creditScore = await SettingModel.getScoreByOperationType('creditScore');
  const { getOriginLevel } = require('../nkcModules/apiFunction');
  const columnArticlesId = [];
  const articlesDid = [];
  const articleId = [];
  const columnsId = [];
  const articleDocumentsObj = {};
  const uidArr = [];
  const userObj = {};
  const columnObj = {};
  const { column: columnSource, zone: zoneSource } =
    await ArticleModel.getArticleSources();

  for (const article of articles) {
    if (article.source === columnSource) {
      columnArticlesId.push(article._id);
    }
    articleId.push(article._id);
    articlesDid.push(article.did);
    uidArr.push(article.uid);
  }
  //查找文章鼓励和学术分信息
  const kcbsRecordsObj = {};
  const xsfsRecordsObj = {};
  const xsfsRecordTypes = await XsfsRecordModel.getXsfsRecordTypes();
  const xsfsRecords = await XsfsRecordModel.find({
    pid: { $in: articleId },
    canceled: false,
    type: xsfsRecordTypes.article,
  }).sort({ toc: 1 });
  const kcbsRecords = await KcbsRecordModel.find({
    articleId: { $in: articleId },
    type: 'creditKcb',
  }).sort({ toc: 1 });
  await KcbsRecordModel.hideSecretInfo(kcbsRecords);
  for (const r of kcbsRecords) {
    uidArr.push(r.from);
    r.to = '';
    if (!kcbsRecordsObj[r.articleId]) {
      kcbsRecordsObj[r.articleId] = [];
    }
    kcbsRecordsObj[r.articleId].push(r);
  }
  for (const r of xsfsRecords) {
    uidArr.push(r.operatorId);
    r.uid = '';
    if (!xsfsRecordsObj[r.pid]) {
      xsfsRecordsObj[r.pid] = [];
    }
    xsfsRecordsObj[r.pid].push(r);
  }
  //查找用户信息
  let users = await UserModel.find({ uid: { $in: uidArr } });
  users = await UserModel.extendUsersInfo(users);
  for (const user of users) {
    userObj[user.uid] = user;
  }
  const { article: articleSource } = await DocumentModel.getDocumentSources();
  const { stable: stableType } = await DocumentModel.getDocumentTypes();
  const {
    unknown: unknownStatus,
    faulty: faultyStatus,
    disabled: disabledStatus,
  } = await DocumentModel.getDocumentStatus();
  const articleDocuments = await DocumentModel.find({
    did: { $in: articlesDid },
    source: articleSource,
    type: stableType,
  });
  for (const d of articleDocuments) {
    articleDocumentsObj[d.did] = d;
  }
  const { article: articleType } = await ColumnPostModel.getColumnPostTypes();
  //查找专栏文章引用
  const columnPosts = await ColumnPostModel.find({
    pid: { $in: columnArticlesId },
    type: articleType,
  });
  const columnPostsObj = {};
  for (const columnPost of columnPosts) {
    columnsId.push(columnPost.columnId);
    columnPostsObj[columnPost.pid] = columnPost;
  }
  const columns = await ColumnModel.find({ _id: { $in: columnsId } });
  for (const column of columns) {
    columnObj[column._id] = {
      _id: column._id,
      name: column.name,
      description: column.description,
      homeUrl: tools.getUrl('columnHome', column._id),
    };
  }
  //查找文章评论引用
  let articlePosts = await ArticlePostModel.find({ sid: { $in: articleId } });
  //获取评论引用信息
  const articlePostsObj = {};
  for (const a of articlePosts) {
    articlePostsObj[a.sid] = a;
  }
  const results = [];
  for (const article of articles) {
    let url;
    let editorUrl;
    let document = articleDocumentsObj[article.did];
    let reason;
    let documentResourceId;
    if (document) {
      const { status } = document;
      if (status === unknownStatus) {
        // TODO OK: 需要从新的审核日志表拿触发审核的原因
        const {
          reviewFinderService,
        } = require('../services/review/reviewFinder.service');
        reason = await reviewFinderService.getReviewReason(
          reviewSources.document,
          document._id,
        );
      } else if (status === disabledStatus) {
        const delLog = await DelPostLogModel.findOne({
          postType: document.source,
          delType: disabledStatus,
          postId: document._id,
          delUserId: document.uid,
        }).sort({ toc: -1 });
        reason = delLog ? delLog.reason : '';
      } else if (status === faultyStatus) {
        const delLog = await DelPostLogModel.findOne({
          postType: document.source,
          // TODO: 退修&屏蔽日志数据结构比较混乱，后续需要统一
          delType: {
            $in: ['faulty', 'toDraft'],
          },
          postId: document._id,
          delUserId: document.uid,
        }).sort({ toc: -1 });
        reason = delLog ? delLog.reason : '';
      }
      documentResourceId = await document.getResourceReferenceId();
    }
    const columnPost = columnPostsObj[article._id];
    if (article.source === columnSource) {
      // 以前：对于没有专栏的文章会跳过拓展文章的相关信息
      // if (!columnPost) {
      //   continue;
      // }
      // editorUrl = `/column/editor?source=column&mid=${columnPost.columnId}&aid=${columnPost.pid}`;
      // url = `/m/${columnPost.columnId}/a/${columnPost._id}`;
      if (columnPost) {
        editorUrl = `/column/editor?source=column&aid=${columnPost.pid}`;
        url = `/m/${columnPost.columnId}/a/${columnPost._id}`;
      } else {
        editorUrl = `/column/editor?source=column&aid=${article._id}`;
        url = `/article/${article._id}`;
      }
    } else if (article.source === zoneSource) {
      editorUrl = `/creation/editor/zone/article?source=zone&aid=${article._id}`;
      url = `/z/a/${article._id}`;
    }
    let credits = xsfsRecordsObj[article._id] || [];
    credits = credits.concat(...(kcbsRecordsObj[article._id] || []));
    for (const r of credits) {
      if (r.from) {
        r.fromUser = userObj[r.from];
        r.creditName = creditScore.name;
      } else {
        r.fromUser = userObj[r.operatorId];
        r.type = 'xsf';
      }
    }
    const { xsf = [], kcb = [] } = await XsfsRecordModel.extendCredits(credits);
    //获取文章引用的资源
    // const resources = await ResourceModel.getResourcesByReference(documentResourceId);
    if (document.origin !== 0) {
      const originDesc = await getOriginLevel(document.origin);
      document = { ...document.toObject(), originDesc };
    } else {
      document = document.toObject();
    }
    const info = {
      ...article.toObject(),
      xsf,
      kcb,
      reason: reason || '',
      document,
      editorUrl,
      user: userObj[article.uid],
      count: articlePostsObj[article._id]
        ? articlePostsObj[article._id].count
        : 0,
      url,
    };
    if (article.source === 'column' && columnPost) {
      info.column = columnObj[columnPost.columnId];
    }
    if (documentResourceId) {
      info.documentResourceId = documentResourceId;
    }
    results.push(info);
  }
  return results;
};

/*
 * 获取单个article的信息
 * */
schema.statics.getArticleInfo = async (article) => {
  const ArticleModel = mongoose.model('articles');
  return (await ArticleModel.getArticlesInfo([article]))[0];
};

/*
 * 通过指定文章ID获取文章数据
 * @param {[String]} articlesId 文章ID组成的数组
 * @param {String} type 返回的数据类型 array, object
 * @return {[Object] or Object}
 *   当返回类型为array时，值为文章数据
 *   当返回类型为object时，键为文章ID，值为文章数据
 *   文章数据格式如下：
 *     @param {String} title 文章标题
 *     @param {String} content 文章内容摘要
 *     @param {String} coverUrl 文章封面图链接
 *     @param {String} statusInfo 文章状态的说明
 *     @param {String} username 发表人用户名
 *     @param {String} uid 发表人ID
 *     @param {String} avatarUrl 发表人头像链接
 *     @param {String} userHome 发表人个人名片页链接
 *     @param {String} time 格式化之后的发表时间
 *     @param {Date} toc 发表时间
 *     @param {String} articleId 文章ID
 *     @param {String} uid 文章的阅读链接
 * */
schema.statics.getArticlesDataByArticlesId = async function (
  articlesId,
  type = 'object',
) {
  const ArticleModel = mongoose.model('articles');
  const UserModel = mongoose.model('users');
  const { getUrl, timeFormat } = require('../nkcModules/tools');
  const nkcRender = require('../nkcModules/nkcRender');
  const articles = await ArticleModel.find({ _id: { $in: articlesId } });
  const usersId = [];
  for (const article of articles) {
    usersId.push(article.uid);
  }
  const usersObj = await UserModel.getUsersObjectByUsersId(usersId);
  const DocumentModel = mongoose.model('documents');
  const { article: articleSource } = await DocumentModel.getDocumentSources();
  const stableDocuments = await DocumentModel.getStableDocumentsBySource(
    articleSource,
    articlesId,
    'object',
  );
  const articleStatus = await ArticleModel.getArticleStatus();
  const obj = {};
  for (const article of articles) {
    let articleUrl = { articleUrl: '' };
    // 没有专栏信息的独立文章暂时跳转到文章预览链接
    if (article.source === 'column') {
      if (!article.sid) {
        articleUrl.articleUrl = `/article/${article._id}`;
      } else {
        articleUrl = await ArticleModel.getArticleUrlBySource(
          article._id,
          article.source,
          article.sid.split('-')[0],
        );
      }
    } else {
      articleUrl = await ArticleModel.getArticleUrlBySource(
        article._id,
        article.source,
        article.sid,
      );
    }
    const stableDocument = stableDocuments[article._id];
    if (!stableDocument) {
      continue;
    }
    const user = usersObj[article.uid];
    if (!user) {
      continue;
    }
    const { title, content, cover, l } = stableDocument;
    let articleData;
    // 暂时屏蔽被撤稿的文章，待专栏改进时一同调整
    // if (!articleUrl.articleUrl) {
    //   article.status = articleStatus.deleted;
    // }
    if (article.status === articleStatus.normal) {
      articleData = {
        status: articleStatus.normal,
        statusInfo: '',
        title,
        content:
          l === 'json'
            ? getJsonStringTextSlice(content, 200)
            : nkcRender.htmlToPlain(content, 200),
        coverUrl: cover ? getUrl('documentCover', cover) : '',
        username: user.username,
        uid: user.uid,
        avatarUrl: getUrl('userAvatar', user.avatar),
        userHome: getUrl('userHome', user.uid),
        time: timeFormat(article.toc),
        toc: article.toc,
        articleId: article._id,
        url: articleUrl.articleUrl,
      };
    } else {
      let articleDataContent = '';
      switch (article.status) {
        case articleStatus.disabled: {
          articleDataContent = '内容已屏蔽';
          break;
        }
        case articleStatus.faulty: {
          articleDataContent = '内容已退回修改';
          break;
        }
        case articleStatus.unknown: {
          articleDataContent = '内容待审核';
          break;
        }
        case articleStatus.deleted: {
          articleDataContent = '内容已删除';
          break;
        }
        default: {
          articleDataContent = '内容暂不予显示';
        }
      }
      // 待改，此处返回的字段之后两个字段，应包含全部字段，只不过字段内容为空
      articleData = {
        status: article.status,
        statusInfo: articleDataContent,
      };
    }
    obj[article._id] = articleData;
  }
  if (type === 'object') {
    return obj;
  } else {
    const results = [];
    for (const articleId of articlesId) {
      const result = obj[articleId];
      if (!result) {
        continue;
      }
      results.push(result);
    }
    return results;
  }
};

/*
 * 文章阅读数量增加
 * */
schema.methods.addArticleHits = async function () {
  await this.updateOne({ $inc: { hits: 1 } });
};

/*
 * 获取文章的收藏数
 * */
schema.statics.getCollectedCountByAid = async function (aid) {
  const SubscribeModel = mongoose.model('subscribes');
  return await SubscribeModel.countDocuments({
    source: subscribeSources.collectionArticle,
    cancel: false,
    sid: aid,
  });
};

/*
 * 通过专栏引用获取专栏文章信息
 * @params {object} 需要获取文章信息的专栏文章引用
 * @return {object}
 *   @params {object} thread 文章信息
 *   @params {object} article 专栏文章内容
 *   @params {object} resources 专栏文章引用的资源信息
 *   @params {object} column 专栏文章的专栏信息
 *   @params {array} auxiliaryCategory 文章辅分类
 *   @params {array} mainCategory 文章主分类
 *   @params {string} mainCategory 文章引用类型 thread article
 * */
schema.statics.getArticleInfoByColumn = async function (columnPost) {
  const ArticleModel = mongoose.model('articles');
  const ResourceModel = mongoose.model('resources');
  const ColumnPostCategoryModel = mongoose.model('columnPostCategories');
  const ColumnModel = mongoose.model('columns');
  const { pid, cid, mcid, columnId } = columnPost;
  const article = await ArticleModel.findOnly({ _id: pid });
  const articleInfo = (await ArticleModel.getArticlesInfo([article]))[0];
  const resources = await ResourceModel.getResourcesByReference(
    articleInfo.documentResourceId,
  );
  // 获取 专栏名称和id
  let column = await ColumnModel.findOne({ _id: columnId });
  column = column.toObject();
  const mainCategory = await ColumnPostCategoryModel.getParentCategoryByIds(
    cid,
  );
  const auxiliaryCategory =
    await ColumnPostCategoryModel.getArticleAllMinorCategories(mcid);
  return {
    _id: columnPost._id,
    thread: article,
    article: articleInfo,
    resources,
    column,
    mainCategory,
    auxiliaryCategory,
    type: columnPost.type,
    mcid,
    cid,
  };
};

/*
 * 指定文章ID获取文章对象
 * @param {[String]} articlesId
 * @return {Object} 键为文章ID，值为文章对象
 * */
schema.statics.getArticlesObjectByArticlesId = async (articlesId) => {
  const ArticleModel = mongoose.model('articles');
  const articles = await ArticleModel.find({ _id: { $in: articlesId } });
  const articlesObj = {};
  for (const article of articles) {
    articlesObj[article._id] = article;
  }
  return articlesObj;
};

/*
 *更新文章点赞数据
 * */
schema.methods.updateArticlesVote = async function () {
  const PostsVoteModel = mongoose.model('postsVotes');
  const { article: articleSource } = await PostsVoteModel.getVoteSources();
  const votes = await PostsVoteModel.find({
    source: articleSource,
    sid: this._id,
  });
  let upNum = 0;
  let downNum = 0;
  for (const vote of votes) {
    if (vote.type === 'up') {
      if (vote.sid === this._id) {
        upNum += vote.num;
      }
    } else {
      if (vote.sid === this._id) {
        downNum += vote.num;
      }
    }
  }
  this.voteUp = upNum;
  this.voteDown = downNum;
  await this.updateOne({
    voteUp: upNum,
    voteDown: downNum,
  });
};

/*
 * 拓展文章作者信息
 * */
schema.methods.extendUser = async function () {
  const UserModel = mongoose.model('users');
  return (this.user = await UserModel.findOnly({ uid: this.uid }));
};

/*
 * 拓展文章信息
 * */
schema.statics.extendArticlesPanelData = async function (articles) {
  const ArticleModel = mongoose.model('articles');
  const nkcRender = require('../nkcModules/nkcRender');
  const tools = require('../nkcModules/tools');
  const CommentModel = mongoose.model('comments');
  const ArticlePostModel = mongoose.model('articlePosts');
  articles = await ArticleModel.getArticlesInfo(articles);
  const contentStatusTypes = {
    normal: 'normal',
    warning: 'warning',
    danger: 'danger',
    disabled: 'disabled',
  };
  const { unknown, disabled, faulty, normal } = articleStatus;
  const _articles = [];
  for (const article of articles) {
    const articlePost = await ArticlePostModel.findOne({ sid: article._id });
    //查找文章最后一条评论
    let comment = null;
    if (articlePost) {
      comment = await CommentModel.findOne({
        sid: articlePost._id,
        status: normal,
      }).sort({ order: -1 });
      if (comment) {
        comment = await CommentModel.getCommentInfo(comment);
      }
    }
    const { document, user: articleUser } = article;
    const user = {
      uid: articleUser.uid,
      username: articleUser.username,
      avatarUrl: tools.getUrl('userAvatar', articleUser.avatar),
      homeUrl: tools.getUrl('userHome', articleUser.uid),
    };
    const content = {
      time: article.toc,
      coverUrl: document.cover
        ? tools.getUrl('documentCover', document.cover)
        : '',
      title: document.title,
      url: article.url,
      digest: article.digest,
      abstract:
        document.l === 'json'
          ? getJsonStringTextSlice(document.content, 200)
          : nkcRender.htmlToPlain(document.content, 200),
      readCount: article.hits,
      voteUpCount: article.voteUp,
      replyCount: article.count,
    };
    const result = {
      type: 'document',
      id: article._id,
      pid: document._id,
      user,
      pages: [],
      categories: [],
      content,
      status: {
        type: contentStatusTypes.normal,
        desc: '',
      },
      reply: null,
    };
    if (article.status === unknown) {
      result.status.type = contentStatusTypes.danger;
      result.status.desc = '审核中';
    } else if (article.status === disabled) {
      result.status.type = contentStatusTypes.disabled;
      result.status.desc = '已屏蔽，仅自己可见';
    } else if (article.status === faulty) {
      result.status.type = contentStatusTypes.warning;
      result.status.desc = '退修中，仅自己可见，修改后对所有人可见';
    }
    if (comment) {
      //拓展reply
      const { user, commentDocument, commentUrl } = comment;
      const { uid, username, avatar } = user;
      const rUser = {
        uid,
        username,
        avatarUrl: tools.getUrl('userAvatar', avatar),
        homeUrl: tools.getUrl('userHome', uid),
      };
      result.reply = {
        user: rUser,
        content: {
          time: commentDocument.toc,
          url: commentUrl,
          abstract:
            commentDocument.l === 'json'
              ? getJsonStringTextSlice(commentDocument.content, 200)
              : nkcRender.htmlToPlain(commentDocument.content, 200),
        },
      };
    }
    _articles.push(result);
  }
  return _articles;
};

module.exports = mongoose.model('articles', schema);
