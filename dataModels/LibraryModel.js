/* 
  文件夹或文件记录
*/
const settings = require('../settings');
const mongoose = settings.database;
const schema = new mongoose.Schema({
  // 唯一ID。顶层文件夹ID会被记录到专业上。
  _id: Number,
  // 数据类型 folder: 文件夹, file: 文件记录
  type: {
    type: String,
    required: true,
    index: 1
  },
  ip: {
    type: String,
    default: ""
  },
  port: {
    type: String,
    default: ""
  },
  // 名称。
  name: {
    type: String,
    required: true,
    index: 1
  },
  // 介绍。
  description: {
    type: String,
    default: ""
  },
  // 顶层文件夹公告
  notice: {
    type: String,
    default: ""
  },
  // 上级文件夹ID
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
  // 最后上传时间或文件记录修改时间
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 所有子子孙孙文件数量总和
  fileCount: {
    type: Number,
    default: 0
  },
  // 所有子子孙孙文件夹数量总和
  folderCount: {
    type: Number,
    default: 0
  },
  // 文件夹被打开的次数或文件记录被查看次数
  hits: {
    type: Number,
    default: 0
  },
  // 文库的上传人
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 附件的上传人
  rUid: {
    type: String,
    default: "",
    index: 1
  },
  // 封面图
  cover: {
	  type: String,
    default: ''
  },
  // 文件分类
  category: {
	  type: String, // book, paper, program, media, other
    index: 1,
    default: ""
  },
  // 文件记录对应的资源ID
  rid: {
    type: String,
    default: "",
    index: 1
  },
  size: {
    type: Number,
    default: 0
  },
  ext: {
    type: String,
    default: ''
  },
  // 标记为删除
  deleted: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 已关闭 针对顶层文件夹
  closed: {
    type: Boolean,
    default: false,
    index: 1
  }
}, {
  collection: "libraries"
});
/* 
  创建文件夹
  @param {Object} options
    @param {String} name 文件夹名称
    @param {String} name 文件夹简介
    @param {Number} lid 上级文件夹ID或文库ID
    @param {String} uid 创建者ID
  @return {Object} 文件夹对象
  @author pengxiguaa 2019-10-21
*/
schema.statics.newFolder = async (options = {}) => {
  const {name, lid = null, uid, description, ip, port} = options;
  const LibraryModel = mongoose.model("libraries");
  const SettingModel = mongoose.model("settings");
  const type = "folder";
  await LibraryModel.checkLibraryInfo(type, options);
  const userCount = await mongoose.model("users").count({uid});
  if(!userCount) throwErr(500, `user not found. uid: ${uid}`);
  let pl;
  if(lid) {
    pl = await LibraryModel.findOne({_id: lid});
    if(!pl) throwErr(500, `library not found. lid: ${lid}`);
    const nav = await pl.getNav();
    // 文件夹层数不能超过10
    if(nav.length >= 10) throwErr(400, `文件夹层数超出限制`);
  }
  const library = LibraryModel({
    _id: await SettingModel.operateSystemID("libraries", 1),
    name,
    type,
    ip,
    port,
    description,
    lid,
    uid
  });
  await library.save();
  if(pl) await pl.computeCount();
  return library;
};
/* 
  创建文件记录
  @param {Object} options
    @param {String} name 文件名称
    @param {String} description 文件简介
    @param {Number} lid 上级文件夹ID
    @param {String} category 文件五项类型之一
    @param {Object} resource 资源对象
  @return {Object} 文件夹对象
  @author pengxiguaa 2019-10-21
*/
schema.statics.newFile = async (options = {}) => {
  const {name, description, category, lid, resource, ip, port, user} = options;
  const LibraryModel = mongoose.model("libraries");
  const SettingModel = mongoose.model("settings");
  const type = "file";
  await LibraryModel.checkLibraryInfo(type, options);
  if(!["paper", "book", "media", "program", "other"].includes(category)) {
    throwErr(500, `文件类型错误，category: ${category}`);
  }
  const {uid, size, ext, rid} = resource;
  const userCount = await mongoose.model("users").count({uid});
  if(!userCount) throwErr(500, `资源uid异常，rid: ${rid}, uid: ${uid}`);
  const pl = await LibraryModel.findOne({_id: lid});
  if(!pl) throwErr(500, `文件夹id异常，lid: ${lid}`);
  const library = LibraryModel({
    _id: await SettingModel.operateSystemID("libraries", 1),
    type,
    lid,
    uid: user.uid,
    rUid: uid,
    name,
    ip,
    port,
    description,
    size,
    ext,
    rid,
    category
  });
  await library.save();
  await pl.computeCount();
  return library;
};
/* 
  校验文件、文件夹名称及简介
*/
schema.statics.checkLibraryInfo = async (type, options) => {
  const {checkString} = require("../nkcModules/checkData");
  const LibraryModel = mongoose.model("libraries");
  const {_id, name, description, lid = null} = options;
  const valueName = type === "folder"? "文件夹": "文件";
  checkString(name, {
    name: `${valueName}名称`,
    minLength: 1,
    maxLength: 500
  });
  checkString(description, {
    name: `${valueName}介绍`,
    minLength: 0,
    maxLength: 1000
  });

  const q = {
    type,
    name,
    deleted: false,
    lid
  };

  if(_id) {
    q._id = {$ne: _id};
  }
  const saveName = await LibraryModel.count(q);
  if(saveName !== 0) throwErr(400, `当前目录下${valueName}名已存在`);
}

/* 
  拓展资源或文件夹
*/
schema.statics.extendLibraries = async (libraries) => {
  const UserModel = mongoose.model("users");
  const ResourceModel = mongoose.model("resources");
  const usersId = [], resourcesId = [];
  libraries.map(library => {
    usersId.push(library.uid);
    if(library.rid) resourcesId.push(library.rid);
  });
  const users = await UserModel.find({uid: {$in: usersId}});
  const resources = await ResourceModel.find({rid: {$in: resourcesId}});
  const usersObj = [], resourcesObj = [];
  users.map(u => {
    usersObj[u.uid] = u;
  });
  resources.map(resource => {
    resourcesObj[resource.rid] = resource;
  });
  libraries = libraries.map(l => {
    l = l.toObject();
    l.user = usersObj[l.uid];
    if(l.rid) l.resource = resourcesObj[l.rid];
    return l;
  });
  return libraries;
};
/* 拓展单个资源或文件夹 */
schema.methods.extend = async function() {
  const LibraryModel = mongoose.model("libraries");
  const results = await LibraryModel.extendLibraries([this]);
  return results[0];
};
/* 获取文件夹下的所有文件夹 */
schema.methods.getFolders = async function() {
  const {_id} = this;
  const LibraryModel = mongoose.model("libraries");
  const pinyin = require("../nkcModules/pinyin.js");
  let folders = await LibraryModel.find({lid: _id, type: "folder", deleted: false});
  folders = await LibraryModel.extendLibraries(folders);
  return pinyin.sortByFirstLetter("object", folders, "name");
};
/* 获取文件夹下的所有文件 */
schema.methods.getFiles = async function() {
  const {_id} = this;
  const LibraryModel = mongoose.model("libraries");
  const pinyin = require("../nkcModules/pinyin.js");
  let files = await LibraryModel.find({lid: _id, type: "file", deleted: false});
  files = await LibraryModel.extendLibraries(files);
  return pinyin.sortByFirstLetter("object", files, "name");
};

/* 
  获取文件夹和上层文件夹组成的数组 层级关系
  @return {[Object]} [顶层, 2层, 3层,..., 当前文件夹]
  @author pengxiguaa 2019-10-23
*/
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

/* 
  获取当前文件夹或文件夹的目录结构
  @return {String} 
*/
schema.methods.getPath = async function() {
  const nav = await this.getNav();
  return "/ " + nav.map(n => n.name).join(" / ");
};

/* 
  计算当前文件夹以及上层所有文件夹中文件的数量
*/
schema.methods.computeCount = async function() {
  const LibraryModel = mongoose.model("libraries");
  // 获取当前文件夹与上边每一层文件夹所组成的数组
  const nav = await this.getNav();
  nav.reverse();
  for(const n of nav) {
    const folders = await LibraryModel.find({lid: n._id, type: "folder", deleted: false}, {fileCount: 1, folderCount: 1});
    let fileCount = await LibraryModel.count({lid: n._id, type: "file", deleted: false});
    let folderCount = folders.length;
    folders.map(f => {
      folderCount += (f.folderCount || 0);
      fileCount += (f.fileCount || 0);
    });
    await n.update({fileCount, folderCount});
  }
};


schema.statics.getPermission = async (user) => {
  if(!user) return [];
  try{
    await mongoose.model("users").ensurePostLibraryPermission(user.uid);
  } catch(err) {
    return [];
  }
  if(!user.roles) await user.extendRoles();
  if(!user.grade) await user.extendGrade();
  let operations = [];
  const librarySettings = await mongoose.model("settings").getSettings("library");
  const {roles, grades} = librarySettings.permission;
  const rolesObj = {}, gradesObj = {};
  roles.map(r => {
    rolesObj[r._id] = r;
  });
  grades.map(g => {
    gradesObj[g._id] = g;
  })
  for(const role of user.roles) {
    const pr = rolesObj[role._id];
    if(pr) {
      operations = operations.concat(pr.operations);
    }
  }
  const pg = gradesObj[user.grade._id];
  if(pg) operations = operations.concat(pg.operations);
  return [...new Set(operations)];
}

schema.methods.ensurePermission = async function(user, operation, modifyOtherLibrary) {
  if(modifyOtherLibrary) return;
  if(["createFile", "createFolder"].includes(operation) || this.uid === user.uid) {
    const permission = await mongoose.model("libraries").getPermission(user);
    if(!permission.includes(operation)) throwErr(403, "权限不足");
  } else {
    throwErr(403, "权限不足");
  }
};
/* 
  同步文库文件记录到搜索数据库
  @param {Number} lid 文件记录ID
  @author pengxiguaa 2019-10-29
*/
schema.statics.saveToES = async (lid) => {
  const LibraryModel = mongoose.model("libraries");
  const library = await LibraryModel.findOne({_id: lid, type: "file"});
  if(!library) throwErr(500, `文件不存在，lid: ${lid}`)
  if(library.deleted) throwErr(500, `文件已被标记为删除，无法同步到搜索数据库。`);
  const elasticSearch = require("../nkcModules/elasticSearch");
  const resourceData = {
    tid: lid,
    t: library.name,
    c: library.description,
    toc: library.tlm || library.toc,
    uid: library.uid
  };
  await elasticSearch.save("resource", resourceData);
}
/* 
  从搜索数据库中删除文库文件记录
  @param {Number} lid 文件记录ID
  @author pengxiguaa 2019-10-29
*/
schema.statics.removeFromES = async (lid) => {
  const elasticSearch = require("../nkcModules/elasticSearch");
  await elasticSearch.delete("resource", lid);
};
module.exports = mongoose.model("libraries", schema);

