const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  uid: {
    type: String,
    required: true,
    index: 1,
  },
  // 素材创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 素材的类型
  type: {
    type: String,
    required: true,
    enum: ['document', 'resource', 'folder'],
    index: 1
  },
  // 素材名称
  // resource 素材默认名称为文件名
  // document 素材名称默认为 document title 或 content 的截取
  name: {
    type: String,
    required: true,
    index: 1
  },
  // 上级素材 ID，主要是文件夹 ID
  mid: {
    type: String,
    default: '',
    index: 1
  },
  // 素材类型对应的 ID
  targetId: {
    type: String,
    default: '',
    index: 1
  },
  // 素材最后修改时间
  tlm: {
    type: Date,
    default: null
  },
  //测试版文档id
  betaDid: {
    type: String,
    default: '',
    index: 1,
  }
}, {
  toObject: {
    getters: true,
    virtuals: true
  }
});

schema.virtual('resource')
  .get(function() {
    return this._resource;
  })
  .set(function(val) {
    return this._resource = val
  });

schema.virtual('document')
  .get(function() {
    return this._document;
  })
  .set(function(val) {
    return this._document = val
  });

/*
* 拓展素材资源信息和文档信息
* */
schema.statics.extentMaterialsInfo = async (materials) => {
  const ResourceModel = mongoose.model('resources');
  const DocumentModel = mongoose.model('documents');
  const resourceArr = [];
  const documentArr = [];
  const resourceObj = {};
  const documentObj = {};
  for(const m of materials) {
    if(m.type === 'resource') {
      resourceArr.push(m.targetId);
    } else if (m.type === 'document') {
      documentArr.push(m.targetId);
    }
  }
  const documents = await DocumentModel.find({_id: {$in: documentArr}}, {
    uid: 1,
    tlm: 1,
    reviewed: 1,
    wordCount: 1,
    _id: 1,
    toc: 1,
  });
  const resources = await ResourceModel.find({rid: {$in: resourceArr}}, {
    _id: 1,
    path: 1,
    rid: 1,
    toc: 1,
    size: 1,
    oname: 1,
    ext: 1,
    mediaType: 1,
  });
  for(const r of resources) {
    resourceObj[r.rid] = r
  }
  for(const d of documents) {
    documentObj[d._id] = d
  }
  const _materials = [];
  for(const m of materials) {
    if(m.type === 'resource') {
      m.resource = resourceObj[m.targetId];
    } else if(m.type === 'document') {
      m.document = documentObj[m.targetId]
    }
    const n = m.toObject();
    _materials.push(n);
  }
  return _materials;
}

/*
* 创建素材和文档
* */
schema.statics.createMaterial = async (props) => {
  const SettingModel = mongoose.model('settings');
  const {uid, content, mid, name} = props;
  const MaterialModel = mongoose.model('materials');
  const time = new Date();
  const DocumentModel = mongoose.model('documents');
  //创建文档
  const document = await DocumentModel.createDocument({
    uid,
    content,
    time,
  });
  const material = await MaterialModel({
    _id: await SettingModel.operateSystemID('materials', 1),
    uid,
    name: name,
    mid,
    betaDid: document._id,
    type: 'document',
  });
  await material.save();
  return material;
}

/*
*修改素材和文档
* */
schema.methods.modifyMaterial = async function(props) {
  const DocumentModel = mongoose.model('documents');
  const {name, content} = props;
  const {targetId, uid, betaDid} = this;
  const time = new Date();
  //如果素材中包含文档的引用id就修改文档否则创建新的文档并将素材的文档引用targetId变为新建文档的_id
  if(betaDid) {
    const betaDocument = await DocumentModel.findOnly({_id: betaDid});
    await betaDocument.updateDocument({
      tlm: time,
      content,
    });
    await this.updateOne({
      $set: {
        name,
        tlm: time,
        targetId: '',
        betaDId: betaDocument._id,
      }
    });
  } else {
    const document = await DocumentModel.createDocument({
      uid,
      content,
    });
    await this.updateOne({
      $set: {
        name,
        betaDid: document._id,
        tlm: time,
      }
    });
  }
}

/*
*提交文档表单修改
* */
schema.methods.publishMaterial = async function() {
  const DocumentModel = mongoose.model('documents');
  const {betaDid, targetId} = this;
  const betaDocument = await DocumentModel.findOnly({_id: betaDid});
  if(targetId) {
    const document = await DocumentModel.findOnly({_id: targetId});
    await document.setAsHistory(betaDocument._id);
  }
  await this.updateOne({
    $set: {
      betaDid: '',
      targetId: betaDocument._id,
      tlm: new Date(),
    }
  });
}

/*
* 获取素材上级的信息
* */
schema.statics.getParentMaterial = async function(props) {
  const MaterialModel = mongoose.model('materials');
  let {crumbs, mid} = props;
  const material = await MaterialModel.findOne({_id: mid?mid:''});
  const {mid: parentId, name, _id} = material;
  crumbs.push({
    _id,
    name,
  });
  if(parentId) {
    crumbs = await MaterialModel.getParentMaterial({
      mid: parentId,
      crumbs
    });
  }
  return crumbs;
}

/*
*根据素材mid获取素材所在文件夹的面包屑
* */
schema.methods.getCrumbs = async function() {
  const MaterialModel = mongoose.model('materials');
  const {mid, name, _id} = this;
  let crumbs = [
    {
      name,
    }
  ];
  if(mid) {
    crumbs = await MaterialModel.getParentMaterial({
      crumbs,
      mid
    });
  }
  crumbs = crumbs.reverse();
  return crumbs;
}

/*
*创建资源文件夹
* */
schema.statics.createMaterialFolder = async function(option) {
  const MaterialModel = mongoose.model('materials');
  const SettingModel = mongoose.model('settings');
  const {name, mid, type, resource, uid} = option;
  const material = await MaterialModel({
    _id: await SettingModel.operateSystemID('materials', 1),
    uid,
    name,
    mid,
    type,
  });
  material.save();
  const arr = [];
  for(const r of resource) {
    if(!r) return;
    arr.push({
      _id: await SettingModel.operateSystemID('materials', 1),
      uid,
      name: r.oname,
      mid: material._id,
      type: 'resource',
      targetId: r.rid,
    });
  }
  await MaterialModel.insertMany(arr);
}

/*
* 合并素材文件分组
* */
schema.statics.mergeMaterials = async function(materials) {
  const arr = [];
  for(const material of materials) {
    if(!material) return;
    arr.push.apply(arr, material.data);
  }
  return arr;
}

module.exports = mongoose.model('materials', schema);
