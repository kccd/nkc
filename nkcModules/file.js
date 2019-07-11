const ei = require("easyimage");
const {upload, statics} = require("../settings");
const fsSync = require("../nkcModules/fsSync");

// 保存专栏头像
exports.saveColumnAvatar = async (columnId, file) => {
  await ei.resize({
    src: file.path,
    dst: upload.columnAvatarPath + "/" + columnId + "_sm.jpg",
    height: 100,
    width: 100,
    quality: 90
  });
  await ei.resize({
    src: file.path,
    dst: upload.columnAvatarPath + "/" + columnId + ".jpg",
    height: 250,
    width: 250,
    quality: 90
  });
  await ei.resize({
    src: file.path,
    dst: upload.columnAvatarPath + "/" + columnId + "_lg.jpg",
    height: 500,
    width: 500,
    quality: 90
  });
  await fsSync.unlink(file.path);
};

// 获取专栏头像文件位置
exports.getColumnAvatar = async (columnId, t) => {
  let filePath = upload.columnAvatarPath + "/" + columnId + ".jpg";
  if(t) {
    filePath = upload.columnAvatarPath + "/" + columnId + "_" + t + ".jpg";
  }
  if(!fsSync.existsSync(filePath)) {
    filePath = statics.defaultColumnAvatarPath;
  }
  return filePath;
};

// 删除专栏头像文件
exports.deleteColumnAvatar = async (columnId) => {
  const t = ["", "_sm", "_lg"];
  for(const tt of t) {
    const filePath = upload.columnAvatarPath + "/" + columnId + tt + ".jpg";
    await fsSync.unlink(filePath);
  }
};

// 保存专栏背景
exports.saveColumnBanner = async (columnId, file) => {
  await ei.resize({
    src: file.path,
    dst: upload.columnBannerPath + "/" + columnId + "_sm.jpg",
    height: 720,
    width: 1280,
    quality: 90
  });
  await ei.resize({
    src: file.path,
    dst: upload.columnBannerPath + "/" + columnId + ".jpg",
    height: 480,
    width: 1920,
    quality: 90
  });
  await fsSync.unlink(file.path);
};

// 获取背景链接
exports.getColumnBanner = async (columnId, t) => {
  let filePath = upload.columnBannerPath + "/" + columnId + ".jpg";
  if(t) {
    filePath = upload.columnBannerPath + "/" + columnId + "_" + t + ".jpg";
  }
  if(!fsSync.existsSync(filePath)) {
    filePath = statics.defaultColumnBannerPath;
  }
  return filePath;
};

// 删除专栏背景文件
exports.deleteColumnBanner = async (columnId) => {
  const t = ["", "_sm"];
  for(const tt of t) {
    const filePath = upload.columnBannerPath + "/" + columnId + tt + ".jpg";
    await fsSync.unlink(filePath);
  }
};
