const ei = require("easyimage");
const FileType = require('file-type');
const {upload, statics} = require("../settings");
const fsSync = require("../nkcModules/fsSync");
const fs = require("fs");
const db = require("../dataModels");
const mime = require('mime');
const func = {};
const PATH = require('path');
const attachmentConfig = require("../config/attachment.json");
const mkdirp = require("mkdirp");
const { sync } = require("mkdirp");

func.folders = {
  attachment: './attachment',
  resource: './resource',
}

/*
* 根据时间和配置文件获取资源所磁盘位置
* 配置文件数据格式:
* [
*   {
*      path: '路径2',
*      startingTime: '1990-01-01',
*      endTime: '2010-01-01'
*   },
*   {
*      path: '路径2',
*      startingTime: '2010-01-01',
*      endTime: '2030-01-01'
*   }
* ]
* @param {Date} t 时间，默认为当前时间
* @return {String} 路径
* */
func.getBasePath = async (t) => {
  let now;
  if(t) {
    now = new Date(t);
  } else {
    now = Date.now();
  }
  if(!attachmentConfig.length) {
    return PATH.resolve(__dirname, '../resources');
  }
  let basePath;
  for(const a of attachmentConfig) {
    const {path, startingTime, endTime} = a;
    const _path = PATH.resolve(path);
    if(!fs.existsSync(path)) throw `指定的目录 ${path} 不存在`;
    const sTime = new Date(startingTime + ' 00:00:00').getTime();
    const eTime = new Date(endTime + ' 00:00:00').getTime();
    if(now >= sTime && now < eTime) {
      basePath = _path;
      break;
    }
  }
  if(!basePath) throw `未找到指定的目录，请检查目录配置是否正确`;
  return basePath;
}

func.getFullPath = async (p, t) => {
  const path = PATH.resolve(await func.getBasePath(t), p);
  await mkdirp(path);
  return path;
};

// 保存专栏头像
func.saveColumnAvatar = async (columnId, file) => {
  const column = await db.ColumnModel.findOnly({_id: columnId});
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = mime.getExtension(file.type);
  if(!["png", "jpg", "jpeg"].includes(ext)) throwErr(400, "仅支持jpg、jpeg和png格式的图片");
  await ei.resize({
    src: file.path,
    dst: upload.columnAvatarPath + "/" + file.hash + "_sm.jpg",
    height: 100,
    width: 100,
    quality: 90
  });
  await ei.resize({
    src: file.path,
    dst: upload.columnAvatarPath + "/" + file.hash + ".jpg",
    height: 250,
    width: 250,
    quality: 90
  });
  await ei.resize({
    src: file.path,
    dst: upload.columnAvatarPath + "/" + file.hash + "_lg.jpg",
    height: 500,
    width: 500,
    quality: 90
  });
  await column.update({avatar: file.hash});
  const imgTypes = ["columnAvatar", "columnAvatarSM", "columnAvatarLG"];
  for(const imgType of imgTypes) {
    const log = await db.ImageLogModel({
      uid: column.uid,
      columnId: columnId,
      imgType,
      imgId: file.hash,
      type: "columnChangeAvatar"
    });
    await log.save();
  }
  await fsSync.unlink(file.path);
};

// 获取专栏头像文件位置
func.getColumnAvatar = async (hash, t) => {
  let filePath = upload.columnAvatarPath + "/" + hash + ".jpg";
  if(t) {
    filePath = upload.columnAvatarPath + "/" + hash + "_" + t + ".jpg";
  }
  if(!fsSync.existsSync(filePath)) {
    filePath = statics.defaultColumnAvatarPath;
  }
  return filePath;
};

// 删除专栏头像文件
func.deleteColumnAvatar = async (columnId) => {
  const column = await db.ColumnModel.findOnly({_id: columnId});
  await column.update({avatar: ""});
  /*const t = ["", "_sm", "_lg"];
  for(const tt of t) {
    const filePath = upload.columnAvatarPath + "/" + column.avatar + tt + ".jpg";
    await fsSync.unlink(filePath);
  }*/
};

// 保存专栏背景
func.saveColumnBanner = async (columnId, file) => {
  const column = await db.ColumnModel.findOnly({_id: columnId});
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = mime.getExtension(file.type);
  if(!["png", "jpg", "jpeg"].includes(ext)) throwErr(400, "仅支持jpg、jpeg和png格式的图片");
  await ei.resize({
    src: file.path,
    dst: upload.columnBannerPath + "/" + file.hash + "_sm.jpg",
    height: 720,
    width: 1280,
    quality: 90
  });
  await ei.resize({
    src: file.path,
    dst: upload.columnBannerPath + "/" + file.hash + ".jpg",
    height: 480,
    width: 1920,
    quality: 90
  });
  await column.update({banner: file.hash});
  const imgTypes = ["columnBanner", "columnBannerSM"];
  for(const imgType of imgTypes) {
    const log = await db.ImageLogModel({
      uid: column.uid,
      columnId: columnId,
      imgType,
      imgId: file.hash,
      type: "columnChangeBanner"
    });
    await log.save();
  }
  await fsSync.unlink(file.path);
};

// 获取背景链接
func.getColumnBanner = async (hash, t) => {
  let filePath = upload.columnBannerPath + "/" + hash + ".jpg";
  if(t) {
    filePath = upload.columnBannerPath + "/" + hash + "_" + t + ".jpg";
  }
  if(!fsSync.existsSync(filePath)) {
    filePath = statics.defaultColumnBannerPath;
  }
  return filePath;
};

// 删除专栏背景文件
func.deleteColumnBanner = async (columnId) => {
  const column = await db.ColumnModel.findOnly({_id: columnId});
  await column.update({banner: ""});
  /*const t = ["", "_sm"];
  for(const tt of t) {
    const filePath = upload.columnBannerPath + "/" + column.hash + tt + ".jpg";
    await fsSync.unlink(filePath);
  }*/
};
/*
* 保存用户头像
* @param {String} uid 用户ID
* @param {File} file 文件对象
* @author pengxiguaa 2019-8-2
* */
func.saveUserAvatar = async (uid, file) => {
  const user = await db.UserModel.findOnly({uid});
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = mime.getExtension(file.type);
  if(!["png", "jpg", "jpeg"].includes(ext)) throwErr(400, "仅支持jpg、jpeg和png格式的图片");
  await ei.resize({
    src: file.path,
    dst: upload.avatarPath + "/" + file.hash + ".jpg",
    height: 192,
    width: 192,
    quality: 90
  });
  await ei.resize({
    src: file.path,
    dst: upload.avatarSmallPath + "/" + file.hash + ".jpg",
    height: 48,
    width: 48,
    quality: 90
  });
  await ei.resize({
    src: file.path,
    dst: upload.avatarLargePath + "/" + file.hash + ".jpg",
    height: 600,
    width: 600,
    quality: 90
  });
  await user.update({avatar: file.hash});
  const imgTypes = ["userAvatar", "userAvatarSM", "userAvatarLG"];
  for(const imgType of imgTypes) {
    const log = await db.ImageLogModel({
      uid: user.uid,
      imgType,
      imgId: file.hash,
      type: "userChangeAvatar"
    });
    await log.save();
  }
  await fsSync.unlink(file.path);
};

/**
* 保存用户头像2.0
* 保存到附件中
* @param {String} uid 用户ID
* @param {File} file 文件对象
 */
func.saveUserAvatar$2 = async (uid, file) => {
  const AM = db.AttachmentModel;
  const user = await db.UserModel.findOnly({uid});
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = await func.getFileExtension(file, ['png', 'jpg', 'jpeg']);
  const {fullPath, timePath} = await AM.getAttachmentPath(true);
  const aid = AM.getNewId();
  await resizeImage(file.path, `${fullPath}/${aid}.${ext}`, 192);
  await resizeImage(file.path, `${fullPath}/${aid}_sm.${ext}`, 48);
  await resizeImage(file.path, `${fullPath}/${aid}_lg.${ext}`, 600);
  const attachment = AM({
    _id: aid,
    path: timePath,
    size: file.size,
    name: file.name,
    hash: file.hash,
    ext,
    type: 'userAvatar',
    uid
  });
  await attachment.save();
  await user.update({avatar: aid});
  await fsSync.unlink(file.path);
  return attachment;
}


/*
* 获取用户头像
* @param {String} hash 文件hash
* @param {String} type 图片尺寸
* @return {String} 文件路径
* @author pengxiguaa 2019-8-2
* */
func.getUserAvatar = async (hash, type) => {
  let filePath;
  if(type === "sm") {
    filePath = upload.avatarSmallPath + "/" + hash + ".jpg";
    if(!fsSync.existsSync(filePath)) {
      filePath = upload.avatarPath + "/" + hash + ".jpg";
    }
  } else if(type === "lg") {
    filePath = upload.avatarLargePath + "/" + hash + ".jpg";
    if(!fsSync.existsSync(filePath)) {
      filePath = upload.avatarPath + "/" + hash + ".jpg";
    }
  } else {
    filePath = upload.avatarPath + "/" + hash + ".jpg";
  }
  if(!fsSync.existsSync(filePath)) {
    filePath = statics.defaultAvatarPath;
  }
  return filePath;
};

/*
* 删除用户头像
* @param {String} uid 用户ID
* @author pengxiguaa 2019-8-2
* */
func.deleteUserAvatar = async (uid) =>{
  const user = await db.UserModel.findOnly({uid});
  await user.update({avatar: ""});
};

/*
* 保存用户背景
* @param {String} uid 用户ID
* @param {File} file 文件对象
* @author pengxiguaa 2019-8-2
* */
func.saveUserBanner = async (uid, file) => {
  const user = await db.UserModel.findOnly({uid});
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = mime.getExtension(file.type);
  if(!["png", "jpg", "jpeg"].includes(ext)) throwErr(400, "仅支持jpg、jpeg和png格式的图片");
  await ei.resize({
    src: file.path,
    dst: upload.userBannerPath + "/" + file.hash + ".jpg",
    height: 400,
    width: 800,
    quality: 95
  });
  await user.update({banner: file.hash});
  const log = await db.ImageLogModel({
    uid: user.uid,
    imgType: "userBanner",
    imgId: file.hash,
    type: "userChangeBanner"
  });
  await log.save();
  await fsSync.unlink(file.path);
};

/**
* 保存用户背景2.0
* 作为附件存储
* @param {String} uid 用户ID
* @param {File} file 文件对象
*/
func.saveUserBanner$2 = async (uid, file) => {
  const AM = db.AttachmentModel;
  const user = await db.UserModel.findOnly({uid});
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = (await FileType.fromFile(file.path)).ext;
  if(!["png", "jpg", "jpeg"].includes(ext)) throwErr(400, "仅支持jpg、jpeg和png格式的图片");
  const {fullPath, timePath} = await AM.getAttachmentPath(true);
  const aid = AM.getNewId();
  await resizeImage(file.path, `${fullPath}/${aid}.${ext}`, 400, 800, 95);
  const attachment = AM({
    _id: aid,
    path: timePath,
    size: file.size,
    name: file.name,
    ext,
    type: 'userBanner',
    uid
  });
  await attachment.save();
  const log = await db.ImageLogModel({
    uid,
    imgType: "userBanner",
    imgId: aid,
    type: "userChangeBanner"
  });
  await log.save();
  await user.update({banner: aid});
  await fsSync.unlink(file.path);
  return aid;
};
/*
* 获取用户背景
* @param {String} hash 文件hash
* @return {String} 文件路径
* @author pengxiguaa 2019-8-2
* */
func.getUserBanner = async (hash) => {
  let filePath = upload.userBannerPath + "/" + hash + ".jpg";
  if(!fsSync.existsSync(filePath)) {
    filePath = statics.defaultUserBannerPath;
  }
  return filePath;
};

/*
* 删除用户背景
* @param {String} uid 用户ID
* @author pengxiguaa 2019-8-2
* */
func.deleteUserBanner = async (uid) =>{
  const user = await db.UserModel.findOnly({uid});
  await user.update({banner: ""});
};

/*
* 获取文章封面
* @param {String} hash 图片hash
* @author pengxiguaa 2019-9-17
* */
func.getPostCover = async (hash) => {
  let filePath = upload.coverPath + "/" + hash + ".jpg";
  if(!hash || !fsSync.existsSync(filePath)) {
    filePath = statics.defaultPostCoverPath;
  }
  return filePath;
};

/*
* 修改post的封面图
* @param {String} pid postID
* @param {File} 图片数据
* @author pengxiguaa 2019-9-17
* */
func.savePostCover = async (pid, file) => {
  const post = await db.PostModel.findOnly({pid});
  const {hash, path} = file;
  const filePath = upload.coverPath + "/" + hash + ".jpg";
  await ei.resize({
    src: path,
    dst: filePath,
    height: 400,
    width: 800,
    background: "#ffffff",
    quality: 90
  });
  await post.update({cover: hash});
  await fsSync.unlink(path);
};
/*
* 修改resource的封面
* @param {String} resource id
* @param {File} 图像数据
* @author pengxiguaa 2019-10-16
* */
func.saveResourceCover = async (rid, file) => {
  const resource = await db.ResourceModel.findOnly({rid});
  const {hash, path} = file;
  const filePath = upload.coverPath + "/" + hash + ".jpg";
  await ei.resize({
    src: path,
    dst: filePath,
    height: 400,
    width: 400,
    background: "#ffffff",
    quality: 90
  });
  await resource.update({cover: hash});
  await fsSync.unlink(path);
};
/*
* 修改draft的封面图
* @param {String} did draftID
* @param {File} 图片数据
* @author pengxiguaa 2019-9-17
* */
func.saveDraftCover = async (did, file) => {
  const draft = await db.DraftModel.findOnly({did});
  const {hash, path} = file;
  const filePath = upload.coverPath + "/" + hash + ".jpg";
  await ei.resize({
    src: path,
    dst: filePath,
    height: 400,
    width: 800,
    background: "#ffffff",
    quality: 90
  });
  await draft.update({cover: hash});
  await fsSync.unlink(path);
};

/*
* 修改post的封面图
* @param {String} pid postID
* @param {[Object]} covers 封面图数据
*   {
*     type: String, // hash: 已保存的封面图，file: 新的封面图
*     data: String/file hash值/文件对象
*   }
* @author pengxiguaa 2019-9-17
* */
func.modifyPostCovers = async (pid, covers) => {
  const post = await db.PostModel.findOnly({pid});
  let coversHash = [], files = [];
  for(const c of covers) {
    const {type, data} = c;
    if(type === "hash") {
      coversHash.push(data);
    } else if(type === "file") {
      files.push(data);
      coversHash.push(data.hash);
    }
  }
  // 删掉旧的封面图
  for(const c of post.covers) {
    if(!coversHash.includes(c)) { // 修改后，删除了原有的封面图
      const filePath = upload.coverPath + "/" + c + ".jpg";
      if(fsSync.existsSync(filePath)) {
        await fsSync.unlink(filePath);
      }
    }
  }
  for(const file of files) {
    const {path, hash} = file;
    const filePath = upload.coverPath + "/" + hash + ".jpg";
    await ei.resize({
      src: path,
      dst: filePath,
      height: 400,
      width: 800,
      background: "#ffffff",
      quality: 90
    });
  }
  await post.update({covers: coversHash});
};

/*
  根据postID生成封面图
*/
func.createPostCoverByPostId = async (pid) => {
  const post = await db.PostModel.findOne({pid});
  if(!post) return;
  const ext = ["jpg", "jpeg", "bmp", "png", "mp4"];
  const cover = await db.ResourceModel.findOne({ext: {$in: ext}, references: pid});
  if(cover) {
    let filePath;
    if(cover.ext === "mp4") {
      filePath = upload.frameImgPath + "/" + cover.rid + ".jpg";
    } else {
      filePath = await cover.getFilePath();
    }
    if(!fsSync.existsSync(filePath)) return;
    const targetPath = upload.coverPath + "/" + pid + ".jpg";
    await ei.resize({
      src: filePath,
      dst: targetPath,
      height: 400,
      background: "#ffffff",
      width: 800,
      quality: 90
    });
    await post.update({cover: pid});
  }
};
/*
* 首页指定文章封面图
* */
func.saveHomeAdCover = async (file, type) => {
  const {hash, path} = file;
  const filePath = upload.coverPath + "/" + hash + ".jpg";
  let height = 253, width = 400;
  if(type === "movable") {
    height = 336;
    width = 800;
  }
  await ei.resize({
    src: path,
    dst: filePath,
    height,
    width,
    quality: 90
  });
};
/*
* 检查文件类型与格式是否对应，返回文件格式
* */
func.getFileExtension = async (file, extensions = []) => {
  let extension = (await FileType.fromFile(file.path)).ext;
  const pathExtension = PATH.extname(file.name).replace('.', '').toLowerCase();
  if(extension !== pathExtension) {
    throwErr(400, "文件内容与后缀名无法对应");
  }
  if(!extension) throwErr(400, '未知的文件格式');
  if(extensions.length) {
    if(!extensions.includes(extension)) {
      throwErr(400, `文件格式不被允许，请选择${extensions.join(', ')}格式的文件。`);
    }
  }
  return extension;
}

/**
 * 重设图片尺寸
 * 参数：
 * fromFile, toFile[, height[, width[, quality]]]
 * 尺寸参数只传入一个时既做高又做宽
 * @param {string} fromFile - 目标文件路径
 * @param {string} toFile - 新文件路径
 */
function resizeImage(fromFile, toFile) {
  let height = 48;
  let width = 48;
  let quality = 90;
  if(typeof arguments[2] === "number" && typeof arguments[3] !== "number") {
    height = arguments[2], width = arguments[2];
  } else if(typeof arguments[2] === "number" && typeof arguments[3] === "number") {
    height = arguments[2], width = arguments[3];
  }
  if(typeof arguments[4] === "number") {
    quality = arguments[4];
  }
  return ei.resize({
    src: fromFile,
    dst: toFile,
    height,
    width,
    quality
  });
}

module.exports = func;
