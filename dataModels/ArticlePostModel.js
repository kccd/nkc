const mongoose = require('../settings/database');
const articlePostSources = {
        column: 'column',
        zone: 'zone',
      };
const schema = new mongoose.Schema({
  _id: String,
  //创建人uid
  uid: {
    type: String,
    required: true,
    index: 1
  },
  //文章article _id
  sid: {
    type: String,
    required: true,
    index: 1
  },
  source: {
    type: String,
    required: true,
    index: 1
  },
  //是否显示文章评论
  hidden: {
    type: Boolean,
    default: false,
    index: 1
  },
  //引用创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  //文章评论数量
  count: {
    type: Number,
    default: 0,
    index: 1,
  }
}, {
  collection: "articlePosts"
});

/*
* 获取评论引用来源
* */
schema.statics.getArticlePostSources = async function() {
  return articlePostSources;
}

/*
* 创建一条引用记录
* */
schema.statics.creatCommentPost = async function(props) {
  const ArticlePostModel = mongoose.model('articlePosts');
  const SettingModel = mongoose.model('settings');
  const {uid, sid, source} = props;
  const commentPost = ArticlePostModel({
    _id: await SettingModel.operateSystemID("articlePosts", 1),
    uid,
    sid,
    source
  });
  await commentPost.save();
  return commentPost;
}

/*
* 通过文章id获取文章下的评论引用
* */
schema.statics.getArticlePostByArticleId = async function(props) {
  const ArticlePostModel = mongoose.model('articlePosts');
  const {sid, source, uid} = props;
  let articlePost = await ArticlePostModel.findOne({sid, source});
  if(!articlePost) {
    //如果不存在引用就创建一条新的引用
    articlePost = await ArticlePostModel.creatCommentPost({uid, sid, source});
  }
  return articlePost;
}

/*
* 获取评论引用信息
* 返回当前引用夫人回复数量
* */
schema.statics.getArticlePostInfo = async function(articlePosts) {
  const CommentModel = mongoose.model('comments');
  const results = [];
  for(const a of articlePosts) {
    results.push({
      ...a.toObject(),
      count: await CommentModel.countDocuments({sid: a._id})
    });
  }
  return results;
};

/*
* 更新评论引用的评论数量
* */
schema.statics.updateOrder = async function(order, aid) {
  const ArticlePostModel = mongoose.model('articlePosts');
  const articlePost = await ArticlePostModel.findOnly({sid: aid});
  articlePost.count = order;
  await articlePost.updateOne({
    $set: {
      count: articlePost.count,
    }
  });
};

module.exports = mongoose.model('articlePosts', schema);
