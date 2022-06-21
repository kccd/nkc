const { ObjectId } = require('mongodb');
const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const draftSchema = new Schema({
  // 编辑器内的内容
  c: {
    type: String,
    default: ''
  },
  // 内容格式
  l: {
    type: String,
    default: ''
  },
  // 标题
  t: {
    type: String,
    default: ''
  },
  // 草稿状态:
  // 编辑(beta) 编辑历史(betaHistory) 发布历史(stableHistory)
  type: {
    type: String,
    default: 'beta',
    index: 1
  },
  // 草稿类型 
  // 如果 destype === forum 代表是新文章（newThread）
  /*destype === forum 
    新文章
    destype === thread
    post.parentPostId === ""
    新回复
    post.parentPostId
    新评论
    新评论暂时没有入口显示新评论 
    destype === post
    post.pid === thread.oc? "modifyThread": "modifyPost"; */
     
    // post.desTypeId 对应的 post.type === thread
    // 修改文章
    // post.desTypeId 对应的 post.type === post
    // 修改回复
    // post.desTypeId 对应的 post.type === post && post.parentPostId
    // 修改评论
    // 目前就四种会被显示
  /* 
  * 草稿类型划分
  * 1 newThread
  * 2 modifyThread
  * 3 newPost
  * 4 modifyPost
  * 5 newComment
  * 6 modifyComment
  */
  desType: {
    type: String,
    default: 'forum',
    index: 1
  },
  // 草稿对应类型的ID， tid,pid等
  desTypeId: {
    type: String,
    default: '',
    index: 1
  },
  // 草稿拥有者
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 草稿ID
  did: {
    type: String,
    default: 0,
    index: 1
  },
  // 创建的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 最后修改时间
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 中文摘要
  abstractCn: {
    type: String,
    default: "",
  },
  // 英文摘要
  abstractEn: {
    type: String,
    default: "",
  },
  // 作者信息
  authorInfos: {
    type: Array,
    default: []
  },
  // 中文关键词
  keyWordsCn: {
    type: Array,
    default: []
  },
  // 英文关键词
  keyWordsEn: {
    type: Array,
    default: []
  },
  // 申明原创
  originState: {
    type: String,
    default: "0"
  },
  // 是否匿名
  anonymous: {
    type: Boolean,
    default: false,
  },
  // 专业分类
  mainForumsId: {
    type: [String],
    default: []
  },
  // 文章分类
  categoriesId: {
    type: [String],
    default: []
  },
  // 调查ID
  surveyId: {
    type: Number,
    default: null
  },
  // 封面图
  cover: {
    type: String,
    default: ""
  },
  // 作为评论 上级postId
  parentPostId: {
    type: String,
    default: ""
  },
  // 多维分类Id
  tcId: {
    type: [Number],
    default: []
  }
}, {
  collection: 'drafts'
});

const draftType = {
  beta: 'beta',
  betaHistory: 'betaHistory',
  stableHistory: 'stableHistory'
};
const desType = {
  forum: 'forum',
  post: 'post',
  thread: 'thread'
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
  if (!_id || !uid) throw new Error('id 或 uid 不存在');
  const DraftModel = mongoose.model("drafts");
  const beta = (await DraftModel.getType()).beta;
  const stableHistory = (await DraftModel.getType()).stableHistory;
  await DraftModel.updateOne({_id: ObjectId(_id), uid, type: beta}, {
    $set: {
      type: stableHistory,
      tlm: Date.now()
    }
  })
}
/* 
* 查找一篇文章最近的新回复草稿
* @param {String} desTypeId 文章id
* @param {String} uid 用户ID
* @return {Object} 返回desTypeId指定文章最近新建的回复草稿
*/
draftSchema.statics.getLatestNewPost = async function (desTypeId, uid) {

  const DraftModel = mongoose.model("drafts");
  const beta = (await DraftModel.getType()).beta; 
  const thread = (await DraftModel.getDesType()).thread;
  return await DraftModel.findOne({ uid, desType: thread, type: beta, desTypeId, parentPostId: ""  })
    .sort({tlm: -1});

}

/* 
* 获取一篇文章最近修改的回复草稿
* @param {String} desTypeId 文章id
* @param {String} uid 用户id
* @param {Object} nkcModules
* @return {Object} 返回desTypeId指定的文章最近新建的回复草稿
*/
draftSchema.statics.getLatestModifyPost = async (desTypeId, uid, nkcModules) => {
  const DraftModel = mongoose.model("drafts");
  const PostsModel = mongoose.model("posts");
  const beta = (await DraftModel.getType()).beta; 
  const post = (await DraftModel.getDesType()).post;
   // 修改回复
   let page = 0;
   let perpage = 100;
   const count = await DraftModel.countDocuments({ uid: uid, desType: post });
   // 这部分根据条件要递归
   async function findLatestModifyPost () {
     const paging = nkcModules.apiFunction.paging(page, count, Number(perpage)); 
    //  获取类型为post的草稿，但post不一定就是修改回复所以需要去post表对比
     const posts = await DraftModel.find({ type: beta, uid, desType: post, desTypeId, parentPostId: "" })
      .sort({tlm: -1})
      .skip(paging.start)
      .limit(paging.perpage);
     if (posts.length) {
       // 在draft表中为post的desTypeId
       let pids = new Set();
       // id为key，表数据为value
       let pidMap = new Map();
       posts.forEach(element => {
         pids.add(element.desTypeId);
         if (!pidMap.has(element.desTypeId)) pidMap.set(element.desTypeId, element);
       });
  
       // 然后分别去匹配查post表中此id对应的type， 如果为post那么就是回复
       let modifyPostData; 
       const post = (await PostsModel.getType()).post;
       for (const [, pid] of [...pids].entries()) {
         modifyPostData = await PostsModel.findOne({ pid, type: post });
        //  if (draftData && postData) {
        //    if (draftData.tlm.getTime() >= pidMap.get(pid).tlm.getTime()) {
        //      return draftData;
        //    } else {
        //      return pidMap.get(pid);
        //    }
        //  } else if (!draftData && postData) {
        //    return pidMap.get(pid);
        //  }
        if (modifyPostData) {
          return pidMap.get(pid);
        }
       };
       if (!modifyPostData) {
        //  if (draftData) {
        //    for (const [, post] of [...posts].entries()) {
        //      // 如果posts表中没有一条数据是post,那么draftData对比posts中数据的修改时间
        //      // 如果draftData的时间都大于他们证明 draftData是最近的修改
        //      if (draftData.tlm.getTime() >= post.tlm.getTime()) {
        //        return draftData
        //      } else {
        //        page++;
        //        // 设置最多递归次数
        //        if (page === 5) {
        //          return 
        //        }
        //        return await findLatestPost();
        //      }
        //    }
        //    // 如果draftData 不存在 并且 没有在post查找到为post的类型
        //  } else {
        //    return await findLatestPost();
        //  }
        page++;
        // 设置最多递归次数
        if (page === 5) return
        return await findLatestModifyPost();
       }
     }
   }
   return await findLatestModifyPost();
}
/* 
* 查找用户最近文章草稿
* @param {String} uid 用户ID
* @return {Object} 查找到的最近新建的文章草稿
*/

draftSchema.statics.getLatestNewThread = async (uid) => {

  const DraftModel = mongoose.model("drafts");
  
  const beta = (await DraftModel.getType()).beta; 
  // const forum = (await DraftModel.getType()).forum; 
  const forum = (await DraftModel.getDesType()).forum;
  // forum 类型一定是文章(获取新文章)
  return await DraftModel.findOne({uid, desType: forum, type: beta}).sort({tlm: -1});
}
/* 
* 获取一篇文章最近的修改草稿
* @param {String} desTypeId 文章id
* @param {String} uid 用户id
* @param {Object} nkcModules
* @return {Object} 返回desTypeId指定的文章最近新建的文章草稿
*/
draftSchema.statics.getLatestModifyThread = async (desTypeId, uid, nkcModules) => {
  const PostsModel = mongoose.model("posts");
  const DraftModel = mongoose.model("drafts");
  const post = (await DraftModel.getDesType()).post;
  const beta = (await DraftModel.getType()).beta; 

  // 获取修改文章
  let page = 0;
  let perpage = 100;
  const count = await DraftModel.countDocuments({ uid, desType: post });
  async function findLatestModifyThread () {
    const paging = nkcModules.apiFunction.paging(page, count, Number(perpage)); 
    // post 类型可能是修改文章，因此需要在post表中比较
    const posts = await DraftModel.find({type: beta, uid, desType: post, desTypeId })
      .sort({tlm: -1})
      .skip(paging.start)
      .limit(paging.perpage);
    if (posts.length) {
      // 在draft表中为post的desTypeId
      let pids = new Set();
      // id为key，表数据为value
      let pidMap = new Map();
      posts.forEach(element => {
        pids.add(element.desTypeId);
        if (!pidMap.has(element.desTypeId)) pidMap.set(element.desTypeId, element)
      });
      // 然后分别去匹配查post表中此id对应的type， 如果为post那么就是回复
      const thread = (await PostsModel.getType()).thread;
      let modifyThreadData;
      for (const [, pid] of [...pids].entries()) {
        modifyThreadData = await PostsModel.findOne({ pid, type: thread  });
        // 比较修改时间
        // if (threadData) return res = pidMap.get(pid)
        // if (draftData && threadData) {
        //   if (draftData.tlm.getTime() >= pidMap.get(pid).tlm.getTime()) {
        //     return draftData;
        //   } else {
        //     return pidMap.get(pid);
        //   }
        // }else if (!draftData && threadData) {
        //   return pidMap.get(pid);
        // }
        if (modifyThreadData) {
          return pidMap.get(pid);
        }
      }
      // 如果未找到继续查找
      if (!modifyThreadData) {
        // if (draftData) {
        //   for (const [, post] of [...posts].entries()) {
        //     // 如果posts中没有一条数据是post,那么draftData对比posts中数据的修改时间
        //     if (draftData.tlm.getTime() >= post.tlm.getTime()) {
        //       return draftData
        //     } else {
        //       page++;
        //       // 设置最多递归次数
        //       if (page === 5) {
        //         return 
        //       }
        //       return await findLatestThread();
        //     }
        //   }
        // } else {
        //   return await findLatestThread();
        // }
        page++;
        // 设置最多递归次数
        if (page === 5) return; 
        return await findLatestModifyThread();
        // 
      }
    }
  }
  return await findLatestModifyThread();
}

/* 获取最近的历史版本 
*  @param {String} did 草稿did
*/
draftSchema.statics.getLatestHistoryByDid = async (did) => {
  if(!did) throw "did 不存在"
  const DraftModel = mongoose.model("drafts");
  betaHistory = (await DraftModel.getType()).betaHistory;
  stableHistory = (await DraftModel.getType()).stableHistory;
  return DraftModel.findOne({did, type: {$in: [betaHistory, stableHistory]}}).sort({tlm: -1})
}
/* 
* 创建历史版
*/
draftSchema.statics.createToBetaHistory = async (_id, desType, uid) => {
  const DraftModel = mongoose.model("drafts");
  const draft = (await DraftModel.findOne({_id, desType, uid})).toObject();
  delete draft._id;
  const betaHistory = (await DraftModel.getType()).betaHistory;
  draft.type = betaHistory;
  draft.tlm = Date.now();
  const betaHistoryDraft = DraftModel(draft);
  return await betaHistoryDraft.save();
}
/* 
* 改为编辑历史版
* @param {String} _id 草稿唯一id
* @param {String} uid 访问的用户id
* @param {String} desType 草稿类型
*/
draftSchema.statics.updateToBetaHistory = async (_id, desType, uid) => {
  if(!_id || !desType || !uid) throw "参数不正确"
  const DraftModel = mongoose.model("drafts");
  const betaHistory = (await DraftModel.getType()).betaHistory;
  return await DraftModel.updateOne({_id: ObjectId(_id), desType, uid},
    {
      $set: {
        type: betaHistory,
        tlm: new Date()
      }
    }
  );
}
draftSchema.methods.updateToBetaHistory = async function () {
  if(!this._id || !this.desType || !this.uid) throw "参数不正确"
  const DraftModel = mongoose.model("drafts");
  const betaHistory = (await DraftModel.getType()).betaHistory;
  return await DraftModel.updateOne({_id: ObjectId(this._id), desType: this.desType, uid: this.uid},
    {
      $set: {
        type: betaHistory,
        tlm: new Date()
      }
    }
  );
}

/* 
* 改为编辑版
* @param {String} _id 草稿唯一id
* @param {String} uid 访问的用户id
* @param {String} desType 草稿类型
*/
draftSchema.statics.updateToBeta = async (_id, desType, uid) => {
  if(!_id || !desType || !uid) throw "参数不正确"
  const DraftModel = mongoose.model("drafts");
  const beta = (await DraftModel.getType()).beta;
  return await DraftModel.updateOne({_id: ObjectId(_id), desType, uid},
    { 
      $set: {
        type: beta,
        tlm: new Date()
      }
    }
  );
}
/* 
* 找出编辑版草稿
* @param {String} did 草稿id
* @param {String} uid 访问的用户id
* @param {String} desType 草稿类型
*/
draftSchema.statics.getBeta = async (did, desType, uid) => {
  if(!did || !desType || !uid) throw "参数不正确"
  const DraftModel = mongoose.model("drafts");
  const beta = (await DraftModel.getType()).beta;
  return await DraftModel.findOne({did, desType, uid, type: beta});
  
}
/* 
* 扩展threadCategories
* param {Array} tcId 
*/
draftSchema.statics.extendThreadCategories = async function(tcId) {
  if(!tcId) throw "参数不存在"
  const ThreadCategoryModel = mongoose.model('threadCategories');
  const threadCategories = await ThreadCategoryModel.getCategoriesById(tcId);
  const threadCategoriesWarning = [];
  for(const tc of threadCategories) {
    if(tc.categoryThreadWarning) {
      threadCategoriesWarning.push(tc.categoryThreadWarning);
    }
    if(tc.nodeThreadWarning) {
      threadCategoriesWarning.push(tc.nodeThreadWarning);
    }
  }
  return  { threadCategories, threadCategoriesWarning }
};
/* 
  点击保存时检查是否应该创建历史版本
*/
draftSchema.methods.checkContentAndCopyToBetaHistory = async function () {
  const DraftModel = mongoose.model("drafts");
  const time = Date.now();
  let needHistory = false;
  // 获取最近创建的历史记录
  const latestHistoryDraft = await DraftModel.getLatestHistoryByDid(this.did);
  if(
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
  if(!needHistory) {

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
   await this.copyToBetaHistory();
  }
}
/*复制一份当前编辑版为编辑历史版 
*/
draftSchema.methods.copyToBetaHistory = async function () {
  const DraftModel = mongoose.model("drafts");
  // latestDraft.tlm = Date.now();
  // // 当前编辑版更新为最新内容
  // await draft.updateOne(latestDraft);
  const betaHistory = (await DraftModel.getType()).betaHistory;
  const beta = (await DraftModel.getType()).beta;
  const preDraft = this.toObject();
  delete preDraft._id;
  const betaDraft = await DraftModel.findOne({did: this.did, type: beta});
  // 创建一条编辑历史内容
  const draft = DraftModel({...preDraft, tlm: betaDraft.tlm , type: betaHistory});
  await draft.save();
}

/*
* 通过草稿ID删除草稿，若草稿上有调查表ID则删除调查表
* @param {String} id 草稿ID
* @param {String} uid 草稿的创建人
* @author pengxiguaa 2019-9-17
* */
draftSchema.statics.removeDraftById = async (id, uid) => {
  const DraftModel = mongoose.model("drafts");
  const SurveyModel = mongoose.model("surveys");
  const draft = await DraftModel.findOne({did: id, uid});
  if(!draft) return;
  // if(!draft) throwErr(500, `未找到ID为${id}的草稿`);
  await draft.deleteOne();
  if(draft.surveyId) {
    await SurveyModel.deleteOne({uid, _id: draft.surveyId});
  }
};


/*
* 通过did设置片段的状态
* @param {string} did 需要改变状态的片段的did
* @param {string} 需要改变的状态
* */
draftSchema.statics.setStatus = async function(did, status) {
  const DraftModel = mongoose.model('drafts');
  const draft = await DraftModel.findOnly({did});
  await draft.updateOne({
    $set: {
      status,
    }
  });
}

module.exports = mongoose.model('drafts', draftSchema);
