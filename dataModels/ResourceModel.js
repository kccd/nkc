const settings = require('../settings');
const cheerio = require('../nkcModules/nkcRender/customCheerio');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const PATH = require('path');
const fsSync = require('../tools/fsSync');
const { existsSync, exists } = require('fs');
const fs = require("fs");
const fsPromise = fs.promises;
const resourceSchema = new Schema({
	rid: {
    type: String,
    unique: true,
    required: true
  },
  // 针对图片 原图ID
  originId: {
    type: String,
    default: ""
  },
  // md5
  hash: {
    type: String,
    default: "",
    index: 1
  },
  // 文件格式 小写字母
  ext: {
    type: String,
    default: ''
  },
  // 文件被下载次数
  hits: {
    type: Number,
    default: 0
  },
  // 上传时的文件名
  oname: {
    type: String,
    default: ''
  },
  // 文件路径
  path: {
    type: String,
    default: ''
    // required: true
  },
  // 文件大小
  size: {
    type: Number,
    default: 0
  },
  // 上传的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 文件路径（旧）
  tpath: {
    type: String,
    default: ''
  },
  // 上传者ID
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 文件类型 mediaPicture: 图片、mediaVideo：视频、mediaAudio：音频、mediaAttachment：附件
  mediaType: {
    type: String,
    index: 1,
    default: ''
  },
  // resource: 普通资源文件、sticker: 表情图片
  type: {
	  type: String,
    index: 1,
    default: "resource"
  },
  // pid、"fund_" + applicationForumId, 表示哪些post引用了该资源
  references: {
	  type: [String],
    index: 1,
    default: []
  },
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  // 为图片时 图片高度
  height: {
    type: Number,
    index: 1,
    default: null
  },
  // 为图片时 图片宽度
  width: {
    type: Number,
    index: 1,
    default: null
  },
  // usable: 正常, useless: 处理失败，不可用, inProcess: 处理中
  state: {
    type: String,
    index: 1,
    default: 'inProcess'
  }
},
{toObject: {
  getters: true,
  virtuals: true
}});


resourceSchema.virtual('isFileExist')
  .get(function() {
    return this._isFileExist;
  })
  .set(function(val) {
    return this._isFileExist = val;
  });

/**
 * 文件是否存在
 */
resourceSchema.methods.setFileExist = async function() {
  const path = await this.getFilePath()
  try{
    await fsPromise.stat(path);
    this.isFileExist = true;
  } catch(err) {
    this.isFileExist = false;
  }
}


/*
  获取文件路径
*/
resourceSchema.methods.getFilePath = async function() {
  const ResourceModel = mongoose.model('resources');
  const {toc, ext, rid} = this;
  const fileFolder = await ResourceModel.getMediaPath(this.mediaType, toc);
  return PATH.resolve(fileFolder, `./${rid}.${ext}`);
};

// 检测html内容中的资源并将指定id存入resource.reference
resourceSchema.statics.toReferenceSource = async function(id, declare) {
  const model = mongoose.model("resources");
	const $ = cheerio.load(declare);
  const resourcesId = [];
  $(`[data-tag="nkcsource"]`).each((index, el) => {
    el = $(el);
    const {type, id} = el.data();
    if(!["picture", "video", "audio", "attachment"].includes(type)) return;
    resourcesId.push(id);
  });
  await model.updateMany({
    rid: {$in: resourcesId}
  }, {
    $addToSet: {
      references: id
    }
  });
};


// 查找一个post引用的所有source
resourceSchema.statics.getResourcesByReference = async function(id) {
  let model = mongoose.model("resources");
  return await model.find({references: id});
};

/*
* 检查用户是否有权限上传当前文件
* @param {Object} user 用户对象
* @param {File} file 文件对象
* */
resourceSchema.statics.checkUploadPermission = async (user, file) => {
  const SettingModel = mongoose.model("settings");
  const ResourceModel = mongoose.model("resources");
  const {getSize} = require("../nkcModules/tools");
  const {getFileExtension} = require("../nkcModules/file");
  const uploadSettings = await SettingModel.getSettings('upload');
  const {countLimit, sizeLimit, extensionLimit} = uploadSettings;
  let {size, ext} = file;
  if(!ext) ext = await getFileExtension(file);
  // 检查文件大小是否符合要求
  let settingSize;
  for(const s of sizeLimit.others) {
    if(s.ext === ext) {
      settingSize = s.size;
      break;
    }
  }
  if(settingSize === undefined) {
    settingSize = sizeLimit.default;
  }
  if(size <= settingSize * 1024) {}
  else {
    throwErr(400, `${ext}文件不能超过${getSize(settingSize * 1024, 1)}`);
  }

  if(!user.grade) await user.extendGrade();
  if(!user.roles) await user.extendRoles();

  // 检查用户当前上传的文件总数是否达到极限
  const today = require("../nkcModules/apiFunction").today();
  const uploadedCount = await ResourceModel.count({uid: user.uid, toc: {$gte: today}});
  const certList = [];
  certList.push(`grade-${user.grade._id}`);
  user.roles.map(role => {
    certList.push(`role-${role._id}`);
  });
  let settingCount = undefined;
  for(const cl of countLimit.others) {
    if(certList.includes(cl.type)) {
      if(settingCount === undefined || settingCount < cl.count) {
        settingCount = cl.count;
      }
    }
  }
  if(settingCount === undefined) {
    settingCount = countLimit.default;
  }
  if(uploadedCount >= settingCount) throwErr(400, '今日上传文件数量已达上限');

  // 检查文件格式黑白名单
  let blacklistArr = undefined, whitelistArr = undefined;
  for(const el of extensionLimit.others) {
    if(certList.includes(el.type)) {
      const {blacklist, whitelist, using} = el;
      if(using === 'blacklist') {
        if(!blacklistArr) blacklistArr = [];
        blacklistArr = blacklistArr.concat(blacklist);
      } else if(using === 'whitelist') {
        if(!whitelistArr) whitelistArr = [];
        whitelistArr = whitelistArr.concat(whitelist);
      } else {
        throwErr(500, `后台上传配置错误，using: ${using}`);
      }
    }
  }
  // 如果用户没有后台配置的证书或等级，则黑白名单取默认值
  if(blacklistArr === undefined && whitelistArr === undefined) {
    const {defaultBlacklist, defaultWhitelist, using} = extensionLimit;
    if(using === 'blacklist') {
      blacklistArr = [].concat(defaultBlacklist);
    } else if(using === 'whitelist') {
      whitelistArr = [].concat(defaultWhitelist);
    } else {
      throwErr(500, `后台上传配置错误，using: ${using}`);
    }
  }
  if(blacklistArr === undefined) {
    // 仅存白名单
    if(!whitelistArr.includes(ext)) throwErr(400, '文件格式不被允许');
  } else if(whitelistArr === undefined) {
    // 仅存黑名单
    if(blacklistArr.includes(ext)) throwErr(400, '文件格式不被允许');
  } else {
    // 黑白名单均有
    // 去除同时存在于黑名单和白名单的文件格式
    blacklistArr = blacklistArr.filter(b => !whitelistArr.includes(b));
    if(blacklistArr.includes(ext)) throwErr(400, '文件格式不被允许');
  }
};

/*
* 获取附件文件夹路径，不包含文件
* @param {String} type mediaAttachment: 附件, mediaPicture: 图片, mediaVideo: 视频, mediaAudio: 音频
* @param {Date} t 基础时间，用于查找资源文件夹
* @return {String} 文件夹路径
* @author pengxiguaa 2020/6/17
* */
resourceSchema.statics.getMediaPath = async (type, t) => {
  const file = require("../nkcModules/file");
  return await file.getPath(type, t);
};

module.exports = mongoose.model('resources', resourceSchema);
