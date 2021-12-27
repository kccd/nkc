const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  did: {
    type: Number,
    default: null,
    index: 1
  },
  betaDid: {
    type: Number,
    default: null,
    index: 1
  },
  cid: {
    type: [String],
    default: [],
    index: 1
  },
  //是否发布
  published: {
    type: Boolean,
    default: false,
    index: 1
  }
}, {
  collection: 'articles'
});

/*
* 向 book 中添加文章，创建 article、document
* @param {Object} props
*   @param {String} title 文章标题，可为空
*   @param {String} content 文章富文本内容，可为空
*   @param {String} uid 作者，不可为空
* @return {Object} 创建的 article 对象
* */
schema.statics.createArticle = async (props) => {
  const {title, content, coverFile, uid} = props;
  const time = new Date();
  const ArticleModel = mongoose.model('articles');
  const SettingModel = mongoose.model('settings');
  const DocumentModel = mongoose.model('documents');
  const document = await DocumentModel.createDocument({
    uid,
    coverFile,
    title,
    content,
    time
  });
  const article = new ArticleModel({
    _id: await SettingModel.getNewId(),
    uid,
    toc: time,
    betaDid: document._id,
  });
  await article.save();
  return article;
}

schema.methods.getBetaDocumentCoverId = async function() {
  const {betaDid} = this;
  if(!betaDid) return '';
  const DocumentModel = mongoose.model('documents');
  const document = await DocumentModel.findOnly({_id: betaDid});
  return document.cover;
};

/*
* 修改 book 中的文章
* @param {Object} props
*   @param {String} title 文章标题，可为空
*   @param {String} content 文章内容，可为空
*   @param {String} cover 原封面 ID，可为空
*   @param {File} coverFile 新的封面图文件对象
* */
schema.methods.modifyArticle = async function(props) {
  const DocumentModel = mongoose.model('documents');
  const {title, content, cover, coverFile} = props;
  const {betaDid, uid} = this;
  const time = new Date();
  if(betaDid) {
    const betaDocument = await DocumentModel.findOnly({_id: betaDid});
    await betaDocument.updateDocument({
      title,
      content,
      cover,
      coverFile,
      tlm: time,
    });
  } else {
    const document = await DocumentModel.createDocument({
      uid,
      title,
      content,
      coverFile
    });
    await this.updateOne({
      $set: {
        betaDid: document._id,
        tlm: time,
        published: true,
      }
    });
  }
}
/*
* 发布 article
* 将正式版设为历史
* 将测试版设为正式版
* */
schema.methods.publishArticle = async function() {
  const DocumentModel = mongoose.model('documents');
  const {did, betaDid} = this;
  const betaDocument = await DocumentModel.findOnly({_id: betaDid});
  if(did) {
    const document = await DocumentModel.findOnly({_id: did});
    await document.setAsHistory(betaDocument._id);
  }
  await this.updateOne({
    $set: {
      betaDid: '',
      did: betaDocument._id,
      tlm: new Date(),
    }
  });
}

schema.statics.checkArticleInfo = async (article) => {
  const {title, content} = article;
  const {checkString} = require('../nkcModules/checkData');
  checkString(title, {
    name: '文章标题',
    minTextLength: 1,
    maxLength: 500
  });
  checkString(content, {
    name: '文章内容',
    maxLength: 200000,
    minTextLength: 1,
    maxTextLength: 10000,
  });
}

module.exports = mongoose.model('articles', schema);
