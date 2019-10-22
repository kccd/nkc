/* 
  文库或文件夹
*/
const settings = require('../settings');
const mongoose = settings.database;
const schema = new mongoose.Schema({
  // 唯一ID。作为文库时，此ID会被记录在专业上。
  _id: Number,
  // 名称。作为文库时默认为专业的名称；作为文件夹时为用户输入的名称。
  name: {
    type: String,
    required: true,
    index: 1
  },
  // 介绍。作为文库时默认为专业的介绍；作为文件夹时为空。
  description: {
    type: String,
    default: ""
  },
  // 文库公告，作为文件夹时为空字符串。
  notice: {
    type: String,
    default: ""
  },
  // 上级文件夹（可能是文库）ID所组成的数组。
  lid: {
    type: Number,
    default: null,
    index: 1
  },
  // 创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 最后上传时间
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 文件数量
  fileCount: {
    type: Number,
    default: 0
  },
  // 文件夹数量
  folderCount: {
    type: Number,
    default: 0
  },
  // 文件夹被打开的次数
  hits: {
    type: Number,
    default: 0
  },
  // 文件夹的创建人
  uid: {
    type: String,
    required: true,
    index: 1
  }
}, {
  collection: "libraries"
});
/* 
  创建文件夹
  @param {String} name 文件夹名称
  @param {Number} lid 上级文件夹ID或文库ID
  @param {String} uid 创建者ID
  @return {Object} 文件夹对象
  @author pengxiguaa 2019-10-21
*/
schema.statics.newFolder = async (options = {}) => {
  const {name, lid, uid, description} = options;
  const LibraryModel = mongoose.model("libraries");
  const SettingModel = mongoose.model("settings");
  const {checkString} = require("../nkcModules/checkData");
  checkString(name, {
    name: "文件夹名称",
    minLength: 1,
    maxLength: 260
  });
  checkString(description, {
    name: "文件夹简介",
    minLength: 0,
    maxLength: 1000
  });
  const userCount = await mongoose.model("users").count({uid});
  if(!userCount) throwErr(500, `user not found. uid: ${uid}`);
  const plCount = await LibraryModel.count({_id: lid});
  if(!plCount) throwErr(500, `library not found. lid: ${lid}`);
  const library = LibraryModel({
    _id: await SettingModel.operateSystemID("libraries", 1),
    name,
    description,
    lid,
    uid
  });
  await library.save();
  return library;
};
/* 
  创建文库
  @param options
    @param {String} name 文库名称
    @param {String} description 文库介绍
    @param {String} fid 文库所属专业ID
    @param {String} uid 创建者ID
  @return {Object} 文库对象
  @author pengxiguaa 2019-10-21
*/
schema.statics.newLibrary = async (options = {}) => {
  const {name, description, uid} = options;
  const {checkString} = require("../nkcModules/checkData");
  checkString(name, {
    name: "文库名称",
    minLength: 1,
    maxLength: 260
  });
  checkString(description, {
    name: "文库介绍",
    minLength: 0,
    maxLength: 1000
  });
  const library = mongoose.model("libraries")({
    _id: await mongoose.model("settings").operateSystemID("libraries", 1),
    name,
    description,
    uid
  });
  await library.save();
  return library;
};

/* 
  查询文件夹下的所有文件及目录
*/

schema.methods.getList = async function() {
  const {_id} = this;
  const LibraryModel = mongoose.model("libraries");
  const ResourceModel = mongoose.model("resources");
  const folders = await LibraryModel.find({lid: _id});
  const resources = await ResourceModel.find({lid: _id});
  return {
    folders,
    resources
  }
};


schema.methods.getNav = async function() {
  const LibraryModel = mongoose.model("libraries");
  const arr = [];
  const getParent = async (lib) => {
    arr.unshift(lib);
    if(lib.lid) {
      const library = await LibraryModel.findOne({_id: lib.lid});
      if(library) await getParent(library);
    }
  };  
  await getParent(this);
  return arr;
};  
module.exports = mongoose.model("libraries", schema);

