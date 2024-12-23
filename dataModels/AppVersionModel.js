const settings = require('../settings');
const { appStores } = require('../settings/app');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const PlatForms = {
  android: 'android',
  ios: 'ios',
};

const Extensions = {
  android: 'apk',
  ios: 'ios',
};

const appVersionSchema = new Schema({
  appPlatForm: {
    type: String,
    default: PlatForms.android,
  },
  appVersion: {
    type: String,
    required: true,
    index: 1,
  },
  appDescription: {
    type: String,
    default: '',
  },
  appSize: {
    type: Number,
    default: 0,
  },
  hash: {
    type: String,
    required: true,
    index: 1,
  },
  fileName: {
    type: String,
    default: '',
  },
  hits: {
    type: Number,
    default: 0,
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1,
  },
  stable: {
    type: Boolean,
    default: false,
    index: 1,
  },
  disabled: {
    type: Boolean,
    default: false,
    index: 1,
  },
  appStores: {
    type: [String],
    default: [],
  },
});

/*
 * 检测app平台是否合法
 * @param {String} platform
 * */
appVersionSchema.statics.checkPlatform = async (platform) => {
  const platforms = Object.values(PlatForms);
  if (!platforms.includes(platform)) {
    throwErr(400, `app platform error. platform=${platform}`);
  }
};
/*
 * 获取当前app的格式
 * @return {String} Extensions
 * */
appVersionSchema.methods.getExtension = async function () {
  const { appPlatForm } = this;
  return Extensions[appPlatForm];
};

/*
 * 获取文件名
 * @return {String} hash.extension
 * */
appVersionSchema.methods.getFilename = async function () {
  const { hash } = this;
  const extension = await this.getExtension();
  return `${hash}.${extension}`;
};

/*
 * 拓展app数据发往前端
 * @return {Object}
 *   @param {String} version 版本号
 *   @param {String} platform 平台
 *   @param {String} description 更新说明
 *   @param {String} sizeString 格式化后的文件大小
 *   @param {Number} size 文件大小 字节
 *   @param {String} hash 文件hash
 *   @param {String} extension 文件格式
 *   @param {String} filename 文件名
 *   @param {String} urlPath 文件下载链接
 * */
appVersionSchema.methods.extendAppData = async function () {
  const { getSize } = require('../nkcModules/tools');
  const { appPlatForm, appDescription, appSize, appVersion, hash } = this;
  const extension = await this.getExtension();
  const filename = await this.getFilename();
  const urlPath = await this.getUrlPath();
  return {
    version: appVersion,
    platform: appPlatForm,
    description: appDescription,
    size: appSize,
    sizeString: getSize(appSize),
    hash: hash,
    extension,
    filename,
    urlPath,
    googlePlay: this.appStores.includes(appStores.GooglePlay),
    appStore: this.appStores.includes(appStores.iOSAPPStore),
  };
};

/*
 * 通过app版本号获取app数据
 * @param {String} version
 * @return {appVersion schema}
 * */
appVersionSchema.statics.getAppByVersion = async (version, platform) => {
  const AppVersionModel = mongoose.model('appVersion');
  const { checkString } = require('../nkcModules/checkData');
  checkString(version, {
    name: '版本号',
    minLength: 1,
  });
  await AppVersionModel.checkPlatform(platform);
  return await AppVersionModel.findOne({
    appVersion: version,
    appPlatform: platform,
  });
};

/*
 * 获取当前稳定版app
 * @return {appVersion schema}
 * */
appVersionSchema.statics.getStableApp = async (platform) => {
  const AppVersionModel = mongoose.model('appVersion');
  await AppVersionModel.checkPlatform(platform);
  return await AppVersionModel.findOne({
    appPlatForm: platform,
    stable: true,
    disabled: false,
  });
};

/*
 * 获取app下载地址path，不包含origin
 * @return {String}
 * */
appVersionSchema.methods.getUrlPath = async function () {
  const { hash, appPlatForm } = this;
  const { getUrl } = require('../nkcModules/tools');
  return getUrl('downloadApp', appPlatForm, hash);
};

module.exports = mongoose.model('appVersion', appVersionSchema, 'appVersion');
