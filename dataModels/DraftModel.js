const { ObjectId } = require('mongodb');
const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const draftSchema = new Schema(
  {
    // 编辑器内的内容
    c: {
      type: String,
      default: '',
    },
    // 内容格式
    l: {
      type: String,
      default: '',
    },
    // 标题
    t: {
      type: String,
      default: '',
    },
    // 草稿状态:
    // 编辑(beta) 编辑历史(betaHistory) 发布历史(stableHistory)
    type: {
      type: String,
      default: 'beta',
      index: 1,
    },
    // 草稿类型
    /*
     * 草稿类型划分
     * 1 newThread desTypeId 无
     * 2 modifyThread  desTypeId是pid
     * 3 newPost desTypeId是tid
     * 4 modifyPost desTypeId是pid
     * 5 newComment desTypeId是tid
     * 6 modifyComment desTypeId是pid
     */
    desType: {
      type: String,
      default: 'forum',
      index: 1,
    },
    // 草稿对应类型的ID， tid,pid等
    desTypeId: {
      type: String,
      default: '',
      index: 1,
    },
    // 草稿拥有者
    uid: {
      type: String,
      required: true,
      index: 1,
    },
    // 草稿ID
    did: {
      type: String,
      default: 0,
      index: 1,
    },
    // 创建的时间
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    // 最后修改时间
    tlm: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    // 中文摘要
    abstractCn: {
      type: String,
      default: '',
    },
    // 英文摘要
    abstractEn: {
      type: String,
      default: '',
    },
    // 作者信息
    authorInfos: {
      type: Array,
      default: [],
    },
    // 中文关键词
    keyWordsCn: {
      type: Array,
      default: [],
    },
    // 英文关键词
    keyWordsEn: {
      type: Array,
      default: [],
    },
    // 申明原创
    originState: {
      type: String,
      default: '0',
    },
    // 是否匿名
    anonymous: {
      type: Boolean,
      default: false,
    },
    // 专业分类
    mainForumsId: {
      type: [String],
      default: [],
    },
    // 文章分类
    categoriesId: {
      type: [String],
      default: [],
    },
    // 调查ID
    surveyId: {
      type: Number,
      default: null,
    },
    // 封面图
    cover: {
      type: String,
      default: '',
    },
    checkNewNotice: {
      type: Boolean,
      default: false,
    },
    noticeContent: {
      type: String,
      default: '',
    },
    // 作为评论 上级postId
    parentPostId: {
      type: String,
      default: '',
    },
    // 针对新建回复的引用postId
    quotePostId: {
      type: String,
      default: '',
    },
    // 多维分类Id
    tcId: {
      type: [Number],
      default: [],
    },
  },
  {
    collection: 'drafts',
  },
);

const draftType = {
  beta: 'beta',
  betaHistory: 'betaHistory',
  stableHistory: 'stableHistory',
};
const desType = {
  // forum: 'forum',
  // post: 'post',
  // thread: 'thread'
  newThread: 'newThread',
  modifyThread: 'modifyThread',
  newPost: 'newPost',
  modifyPost: 'modifyPost',
  newComment: 'newComment',
  modifyComment: 'modifyComment',
};
/*
 * 获取草稿的type
 * @return {Object}
 */
draftSchema.statics.getType = async () => draftType;
/*
 * 获取草稿DesType
 * @return {Object}
 */
draftSchema.statics.getDesType = async () => desType;

/*
 * 通过ID 更改草稿为发布历史版
 * @param {String} _id 草稿唯一id
 * @param {String} uid 访问的用户id
 */
draftSchema.statics.updateToStableHistoryById = async (_id, uid) => {
  if (!_id || !uid) {
    throw new Error('id 或 uid 不存在');
  }
  const DraftModel = mongoose.model('drafts');
  const beta = (await DraftModel.getType()).beta;
  const stableHistory = (await DraftModel.getType()).stableHistory;
  await DraftModel.updateOne(
    { _id: new ObjectId(_id), uid, type: beta },
    {
      $set: {
        type: stableHistory,
        tlm: Date.now(),
      },
    },
  );
};
/*
 * 查找一篇文章最近的新回复草稿
 * @param {String} desTypeId 文章id
 * @param {String} uid 用户ID
 * @param {Number} limit 返回草稿的数量
 * @return {Array} 返回desTypeId指定文章最近新建的回复草稿
 */
draftSchema.statics.getLatestNewPost = async function (
  desTypeId,
  uid,
  limit = 1,
) {
  const DraftModel = mongoose.model('drafts');
  const beta = (await DraftModel.getType()).beta;
  const newPost = (await DraftModel.getDesType()).newPost;
  return await DraftModel.find({
    uid,
    desType: newPost,
    type: beta,
    desTypeId,
    parentPostId: '',
  })
    .sort({ tlm: -1 })
    .limit(limit);
};

/*
 * 获取一篇文章最近修改的回复草稿
 * @param {String} desTypeId 文章id
 * @param {String} uid 用户id
 * @param {Object} nkcModules
 * @param {Number} limit 返回草稿的数量
 * @return {Array} 返回desTypeId指定的文章最近新建的回复草稿
 */
draftSchema.statics.getLatestModifyPost = async (
  desTypeId,
  uid,
  nkcModules,
  limit = 1,
) => {
  const DraftModel = mongoose.model('drafts');
  // const PostsModel = mongoose.model("posts");
  const beta = (await DraftModel.getType()).beta;
  const modifyPost = (await DraftModel.getDesType()).modifyPost;
  return await DraftModel.find({
    type: beta,
    uid,
    desType: modifyPost,
    desTypeId,
    parentPostId: '',
  })
    .sort({ tlm: -1 })
    // .skip(paging.start)
    .limit(limit);

  // 修改回复
  /*  let page = 0;
   let perpage = 100;
   const count = await DraftModel.countDocuments({ uid: uid, desType: post });
   const verifiedData = []; */

  // 这部分根据条件要递归
  /* async function findLatestModifyPost () {
     const paging = nkcModules.apiFunction.paging(page, count, perpage);
    //  获取类型为post的草稿，但post不一定就是修改回复所以需要去post表对比
     const posts = await DraftModel.find({ type: beta, uid, desType: post, desTypeId, parentPostId: "" })
      .sort({tlm: -1})
      .skip(paging.start)
      .limit(paging.perpage);

     if (posts.length) {
       // 在draft表中为post的desTypeId
       let pids = new Set();
       // id为key，表数据为value
      //  let pidMap = new Map();
       posts.forEach(element => {
         pids.add(element.desTypeId);
        //  if (!pidMap.has(element.desTypeId)) pidMap.set(element.desTypeId, element);
       });
  
       // 然后分别去匹配查post表中此id对应的type， 如果为post那么就是回复
       let modifyPostData;
       const post = (await PostsModel.getType()).post;
       for (const [, pid] of [...pids].entries()) {
        modifyPostData = await PostsModel.findOne({ pid, type: post });
        // 如果存在，就去posts中把相同id全部放进verifiedData，证明他们全部都是最近的修改回复
         if (modifyPostData) {
          for (const post of posts) {
            if (verifiedData.length < limit) {
              if (String(post.desTypeId) === String(pid)) {
                verifiedData.push(post);
              }
            };
            if (verifiedData.length >= limit) return verifiedData;
          }
          // return pidMap.get(pid);
        }
       };
       if (verifiedData.length < limit) {
        // 设置最多递归次数
        if (page === 5) return verifiedData;
        page++;
        return await findLatestModifyPost();
       }
     } else return verifiedData;
   }
   return await findLatestModifyPost(); */
};
/*
 * 查找用户最近文章草稿
 * @param {String} uid 用户ID
 * @param {Number} limit 返回草稿的数量
 * @return {Array} 查找到的最近新建的文章草稿
 */

draftSchema.statics.getLatestNewThread = async (uid, limit = 1) => {
  const DraftModel = mongoose.model('drafts');

  const beta = (await DraftModel.getType()).beta;
  // const forum = (await DraftModel.getType()).forum;
  const newThread = (await DraftModel.getDesType()).newThread;
  // forum 类型一定是文章(获取新文章)
  return DraftModel.find({ uid, desType: newThread, type: beta })
    .sort({ tlm: -1 })
    .limit(limit);
};
/*
 * 获取一篇文章最近的修改草稿
 * @param {String} desTypeId 文章id
 * @param {String} uid 用户id
 * @param {Number} limit 返回草稿的数量
 * @return {Array} 返回desTypeId指定的文章最近新建的文章草稿
 */
draftSchema.statics.getLatestModifyThread = async (
  desTypeId,
  uid,
  limit = 1,
) => {
  // const PostsModel = mongoose.model("posts");
  const DraftModel = mongoose.model('drafts');
  const modifyThread = (await DraftModel.getDesType()).modifyThread;
  const beta = (await DraftModel.getType()).beta;
  return (
    DraftModel.find({ type: beta, uid, desType: modifyThread, desTypeId })
      .sort({ tlm: -1 })
      // .skip(paging.start)
      .limit(limit)
  );

  // 获取修改文章
  // let page = 0;
  // let perpage = 100;
  // const count = await DraftModel.countDocuments({ uid, desType: modifyThread });
  // let verifiedData = [];
  /*  async function findLatestModifyThread () {
    const paging = nkcModules.apiFunction.paging(page, count, perpage);
    // post 类型可能是修改文章，因此需要在post表中比较
    const posts = await DraftModel.find({type: beta, uid, desType: post, desTypeId })
      .sort({tlm: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    if (posts.length) {
      // 在draft表中为post的desTypeId
      let pids = new Set();
      // id为key，表数据为value
      // let pidMap = new Map();
      posts.forEach(element => {
        pids.add(element.desTypeId);
        // if (!pidMap.has(element.desTypeId)) pidMap.set(element.desTypeId, element)
      });
      // 然后分别去匹配查post表中此id对应的type， 如果为post那么就是回复
      const thread = (await PostsModel.getType()).thread;
      let modifyThreadData;
      for (const [, pid] of [...pids].entries()) {
        modifyThreadData = await PostsModel.findOne({ pid, type: thread  });
        // 如果存在，就去posts中把相同id全部放进verifiedData，证明他们全部都是最近的修改文章
        if (modifyThreadData) {
          for (const post of posts) {
            if (verifiedData.length < limit) {
              if (String(post.desTypeId) === String(pid)) {
                verifiedData.push(post);
              }
            }
            if (verifiedData.length >= limit) return verifiedData
          }
          // return pidMap.get(pid);
        }
      }
      // 如果未找到继续查找
      if (verifiedData.length < limit) {
        // 设置最多递归次数
        if (page === 5) return verifiedData;
        page++;
        return await findLatestModifyThread();
      }
    } else return verifiedData
  }
  return await findLatestModifyThread(); */
};

/* 获取最近的历史版本
 *  @param {String} did 草稿did
 */
draftSchema.statics.getLatestHistoryByDid = async (did) => {
  if (!did) {
    throw 'did 不存在';
  }
  const DraftModel = mongoose.model('drafts');
  betaHistory = (await DraftModel.getType()).betaHistory;
  stableHistory = (await DraftModel.getType()).stableHistory;
  return DraftModel.findOne({
    did,
    type: { $in: [betaHistory, stableHistory] },
  }).sort({ tlm: -1 });
};
/*
 * 创建历史版
 */
draftSchema.statics.createToBetaHistory = async (_id, desType, uid) => {
  const DraftModel = mongoose.model('drafts');
  const draft = (await DraftModel.findOne({ _id, desType, uid })).toObject();
  delete draft._id;
  const betaHistory = (await DraftModel.getType()).betaHistory;
  draft.type = betaHistory;
  draft.tlm = Date.now();
  const betaHistoryDraft = DraftModel(draft);
  return await betaHistoryDraft.save();
};
/*
 * 改为编辑历史版
 * @param {String} _id 草稿唯一id
 * @param {String} uid 访问的用户id
 * @param {String} desType 草稿类型
 */
draftSchema.statics.updateToBetaHistory = async (_id, desType, uid) => {
  if (!_id || !desType || !uid) {
    throw '参数不正确';
  }
  const DraftModel = mongoose.model('drafts');
  const betaHistory = (await DraftModel.getType()).betaHistory;
  return await DraftModel.updateOne(
    { _id: new ObjectId(_id), desType, uid },
    {
      $set: {
        type: betaHistory,
        tlm: new Date(),
      },
    },
  );
};
draftSchema.methods.updateToBetaHistory = async function () {
  if (!this._id || !this.desType || !this.uid) {
    throw '参数不正确';
  }
  const DraftModel = mongoose.model('drafts');
  const betaHistory = (await DraftModel.getType()).betaHistory;
  return await DraftModel.updateOne(
    { _id: new ObjectId(this._id), desType: this.desType, uid: this.uid },
    {
      $set: {
        type: betaHistory,
        tlm: new Date(),
      },
    },
  );
};

/*
 * 改为编辑版
 * @param {String} _id 草稿唯一id
 * @param {String} uid 访问的用户id
 * @param {String} desType 草稿类型
 */
draftSchema.statics.updateToBeta = async (_id, desType, uid) => {
  if (!_id || !desType || !uid) {
    throw '参数不正确';
  }
  const DraftModel = mongoose.model('drafts');
  const beta = (await DraftModel.getType()).beta;
  return await DraftModel.updateOne(
    { _id: new ObjectId(_id), desType, uid },
    {
      $set: {
        type: beta,
        tlm: new Date(),
      },
    },
  );
};
/*
 * 找出编辑版草稿
 * @param {String} did 草稿id
 * @param {String} uid 访问的用户id
 * @param {String} desType 草稿类型
 */
draftSchema.statics.getBeta = async (desTypeId, desType, uid) => {
  if (!desTypeId || !desType || !uid) {
    throw '参数不正确';
  }
  const DraftModel = mongoose.model('drafts');
  const beta = (await DraftModel.getType()).beta;
  const { newThread } = await DraftModel.getDesType();
  if (desType === newThread) {
    return await DraftModel.findOne({
      did: desTypeId,
      desType,
      uid,
      type: beta,
    });
  } else {
    return await DraftModel.findOne({ desTypeId, desType, uid, type: beta });
  }
};
/*
 * 扩展threadCategories
 * param {Array} tcId
 */
draftSchema.statics.extendThreadCategories = async function (tcId) {
  if (!tcId) {
    throw '参数不存在';
  }
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const threadCategories = await ThreadCategoryModel.getCategoriesById(tcId);
  const threadCategoriesWarning = [];
  for (const tc of threadCategories) {
    if (tc.categoryThreadWarning) {
      threadCategoriesWarning.push(tc.categoryThreadWarning);
    }
    if (tc.nodeThreadWarning) {
      threadCategoriesWarning.push(tc.nodeThreadWarning);
    }
  }
  return { threadCategories, threadCategoriesWarning };
};
/*
  点击保存时检查是否应该创建历史版本
*/
draftSchema.methods.checkContentAndCopyToBetaHistory = async function () {
  const DraftModel = mongoose.model('drafts');
  const time = Date.now();
  let needHistory = false;
  // 获取最近创建的历史记录
  const latestHistoryDraft = await DraftModel.getLatestHistoryByDid(this.did);
  if (
    // 如果没有历史版本则直接保存
    !latestHistoryDraft ||
    // 如果超过 30 分钟未保存历史则保存
    time - new Date(latestHistoryDraft.tlm).getTime() > 30 * 60 * 1000 ||
    // 如果内容有变动则保存
    this.cover !== latestHistoryDraft.cover ||
    String(this.originState) !== String(latestHistoryDraft.originState)
  ) {
    needHistory = true;
  }
  if (!needHistory) {
    const {
      t: betaTitle = '',
      c: betaC = '',
      keyWordsEn: betaKeywordsEN = [],
      keyWordsCn: betaKeywords = [],
      abstractEn: betaAbstractEN = '',
      abstractCn: betaAbstract = '',
    } = this;

    const {
      t: latestHistoryTitle = '',
      c: latestC = '',
      keyWordsEn: latestHistoryKeywordsEN = [],
      keyWordsCn: latestHistoryKeywords = [],
      abstractEn: latestHistoryAbstractEN = '',
      abstractCn: latestHistoryAbstract = '',
    } = latestHistoryDraft;

    // 统计内容字数变动
    let count = 0;
    count += betaC.length - latestC.length;
    count += betaTitle.length - latestHistoryTitle.length;
    count +=
      betaKeywords.join('').length - latestHistoryKeywords.join('').length;
    count +=
      betaKeywordsEN.join('').length - latestHistoryKeywordsEN.join('').length;
    count += betaAbstract.length - latestHistoryAbstract.length;
    count += betaAbstractEN.length - latestHistoryAbstractEN.length;
    count = Math.abs(count);
    // 若内容字数变动超过100，则存历史
    if (count > 100) {
      needHistory = true;
    }
  }
  if (needHistory) {
    await this.copyToBetaHistory();
  }
};
/*复制一份当前编辑版为编辑历史版
 */
draftSchema.methods.copyToBetaHistory = async function () {
  const DraftModel = mongoose.model('drafts');
  // latestDraft.tlm = Date.now();
  // // 当前编辑版更新为最新内容
  // await draft.updateOne(latestDraft);
  const betaHistory = (await DraftModel.getType()).betaHistory;
  const beta = (await DraftModel.getType()).beta;
  const preDraft = this.toObject();
  delete preDraft._id;
  const betaDraft = await DraftModel.findOne({ did: this.did, type: beta });
  // 创建一条编辑历史内容
  const draft = DraftModel({
    ...preDraft,
    tlm: betaDraft.tlm,
    type: betaHistory,
  });
  await draft.save();
};

/*
 * 通过草稿ID删除草稿，若草稿上有调查表ID则删除调查表
 * @param {String} id 草稿ID
 * @param {String} uid 草稿的创建人
 * @author pengxiguaa 2019-9-17
 * */
draftSchema.statics.removeDraftById = async (id, uid) => {
  const DraftModel = mongoose.model('drafts');
  const SurveyModel = mongoose.model('surveys');
  const draft = await DraftModel.findOne({ did: id, uid });
  if (!draft) {
    return;
  }
  // if(!draft) throwErr(500, `未找到ID为${id}的草稿`);
  await draft.deleteOne();
  if (draft.surveyId) {
    await SurveyModel.deleteOne({ uid, _id: draft.surveyId });
  }
};

/*
 * 通过did设置片段的状态
 * @param {string} did 需要改变状态的片段的did
 * @param {string} 需要改变的状态
 * */
draftSchema.statics.setStatus = async function (did, status) {
  const DraftModel = mongoose.model('drafts');
  const draft = await DraftModel.findOnly({ did });
  await draft.updateOne({
    $set: {
      status,
    },
  });
};

module.exports = mongoose.model('drafts', draftSchema);
