const ei = require("easyimage");
const {upload, statics, mediaPath} = require("../settings");
const fsSync = require("../nkcModules/fsSync");
const fs = require("fs");
const db = require("../dataModels");
const mime = require('mime');

// 保存专栏头像
exports.saveColumnAvatar = async (columnId, file) => {
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
exports.getColumnAvatar = async (hash, t) => {
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
exports.deleteColumnAvatar = async (columnId) => {
  const column = await db.ColumnModel.findOnly({_id: columnId});
  await column.update({avatar: ""});
  /*const t = ["", "_sm", "_lg"];
  for(const tt of t) {
    const filePath = upload.columnAvatarPath + "/" + column.avatar + tt + ".jpg";
    await fsSync.unlink(filePath);
  }*/
};

// 保存专栏背景
exports.saveColumnBanner = async (columnId, file) => {
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
exports.getColumnBanner = async (hash, t) => {
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
exports.deleteColumnBanner = async (columnId) => {
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
exports.saveUserAvatar = async (uid, file) => {
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
/*
* 获取用户头像
* @param {String} hash 文件hash
* @param {String} type 图片尺寸
* @return {String} 文件路径
* @author pengxiguaa 2019-8-2
* */
exports.getUserAvatar = async (hash, type) => {
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
exports.deleteUserAvatar = async (uid) =>{
  const user = await db.UserModel.findOnly({uid});
  await user.update({avatar: ""});
};

/*
* 保存用户背景
* @param {String} uid 用户ID
* @param {File} file 文件对象
* @author pengxiguaa 2019-8-2
* */
exports.saveUserBanner = async (uid, file) => {
  const user = await db.UserModel.findOnly({uid});
  if(file.size > 20*1024*1024) throwErr(400, '图片不能超过20M');
  const ext = mime.getExtension(file.type);
  if(!["png", "jpg", "jpeg"].includes(ext)) throwErr(400, "仅支持jpg、jpeg和png格式的图片");
  await ei.resize({
    src: file.path,
    dst: upload.userBannerPath + "/" + file.hash + ".jpg",
    height: 400,
    width: 800,
    quality: 90
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
/*
* 获取用户背景
* @param {String} hash 文件hash
* @return {String} 文件路径
* @author pengxiguaa 2019-8-2
* */
exports.getUserBanner = async (hash) => {
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
exports.deleteUserBanner = async (uid) =>{
  const user = await db.UserModel.findOnly({uid});
  await user.update({banner: ""});
};

/*
* 获取文章封面
* @param {String} hash 图片hash
* @author pengxiguaa 2019-9-17
* */
exports.getPostCover = async (hash) => {
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
exports.savePostCover = async (pid, file) => {
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
exports.saveResourceCover = async (rid, file) => {
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
exports.saveDraftCover = async (did, file) => {
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
exports.modifyPostCovers = async (pid, covers) => {
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
exports.createPostCoverByPostId = async (pid) => {
  const post = await db.PostModel.findOne({pid});
  if(!post) return;
  const ext = ["jpg", "jpeg", "bmp", "png", "mp4"];
  const cover = await db.ResourceModel.findOne({ext: {$in: ext}, references: pid});
  if(cover) {
    let filePath;
    if(cover.ext === "mp4") {
      filePath = upload.frameImgPath + "/" + cover.rid + ".jpg";
    } else {
      filePath = mediaPath.selectDiskCharacterDown(cover) + "/" + cover.path;
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
