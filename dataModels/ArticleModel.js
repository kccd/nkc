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
    type: String,
    default: '',
    index: 1
  },
  betaDid: {
    type: String,
    default: '',
    index: 1
  },
  cid: {
    type: [String],
    default: [],
    index: 1
  },
  published: {
    type: Boolean,
    default: false,
    index: 1
  }
}, {
  collection: 'articles'
});

/*
* 创建未发布的文章
* */
schema.statics.createArticle = async (props) => {
  const {title, content, cover, uid} = props;
  const time = new Date();
  const ArticleModel = mongoose.model('articles');
  const DocumentModel = mongoose.model('documents');
  const document = await DocumentModel.createDocument({
    uid,
    cover,
    title,
    content,
    time
  });
  const article = new ArticleModel({
    uid,
    toc: time,
    bateDid: document._id,
  });
  await article.save();
  return article;
}
schema.methods.modifyArticle = async function(props) {
  const DocumentModel = mongoose.model('documents');
  const {title, content, cover} = props;
  const {betaDid, uid} = this;
  const time = new Date();
  if(betaDid) {
    const betaDocument = await DocumentModel.findOnly({_id: betaDid});
    await betaDocument.updateDocument({
      title,
      content,
      cover,
      tlm: time,
    });
  } else {
    const document = await DocumentModel.createDocument({
      uid,
      title,
      content,
      cover
    });
    await this.updateOne({
      $set: {
        betaDid: document._id,
        tlm: time
      }
    });
  }
}

schema.methods.publishArticle = async function() {
  const DocumentModel = mongoose.model('document');
  const {did, betaDid} = this;
  const document = await DocumentModel.findOnly({_id: did});
  const betaDocument = await DocumentModel.findOnly({_id: betaDid});
  await document.setAsHistory(betaDocument._id);
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