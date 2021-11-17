const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const PATH = require('path');
const schema = new Schema({
  // 附件ID mongoose.Types.ObjectId().toString()
  _id: String,
  // 附件类型
  type: {
    // userAvatar, userBanner,
    // forumBanner, forumLogo
    // columnAvatar, columnBanner,
    // homeBigLogo,
    // postCover,
    // problemImage,
    // recommendThreadCover,
    // fundAvatar, fundBanner
    // scoreIcon
    type: String,
    required: true,
    index: 1
  },
  // 附件拥有者ID
  uid: {
    type: String,
    default: '',
    index: 1,
  },
  // 附件目录 不包含文件名
  path: {
    type: String,
    default: '',
    index: 1,
  },
  // 创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 附件大小
  size: {
    type: Number,
    default: 0,
  },
  // 附件格式
  ext: {
    type: String,
    required: true,
    index: 1
  },
  // 附件原文件名
  name: {
    type: String,
    default: '',
  },
  // 附件hash
  hash: {
    type: String,
    index: 1,
    default: ''
  },
  //
  c: {
    type: String,
    default: '',
    index: 1
  },
  files: {
    def: Schema.Types.Mixed,
    sm: Schema.Types.Mixed,
    lg: Schema.Types.Mixed,
    md: Schema.Types.Mixed,
    /*
    {
      ext: String,
      hash: String, // 文件 md5
      size: Number, // 文件大小
      height: Number, // 图片、视频高
      width: Number,  // 图片、视频宽
      name: String, // 在存储服务磁盘上的文件名
      duration: Number, // 音视频时长
      mtime: Date, // 最后修改时间
    }
    */
  },
}, {
  collection: 'attachments'
});


/*
* 获取新的附件ID
* @return {String} id
* @author pengxiguaa 2020/6/12
* */
schema.statics.getNewId = () => {
  return mongoose.Types.ObjectId().toString();
};


/**
 * 保存首页大Logo
 * @param {File} file - file对象
 * @return {Object} attachment 对象
 */
schema.statics.saveHomeBigLogo = async file => {
  const AttachmentModel = mongoose.model('attachments');
  const SettingModel = mongoose.model('settings');
  const FILE = require("../nkcModules/file");
  const time = new Date();
  const aid = await AttachmentModel.getNewId();
  const ext = await FILE.getFileExtension(file, ['jpeg', 'jpg', 'png']);
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    ext,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type: 'homeBigLogo',
    images: [
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: 107,
        width: 388,
        quality: 95
      }
    ]
  });
  await SettingModel.updateOne({_id: 'home'}, {
    $push: {
      'c.homeBigLogo': aid
    }
  });
  await SettingModel.saveSettingsToRedis('home');
  return attachment;
}

/*
* 保存专业Logo
* @param {String} fid 专业 ID
* @param {String} type forumLogo: 专业头像, forumBanner: 专业背景
* @param {File} file 文件对象
* @return {Object} attachment 对象
* @author pengxiguaa 2021/11/16
* */
schema.statics.saveForumImage = async (fid, type, file) => {
  if(!['forumLogo', 'forumBanner'].includes(type)) throwErr(400, '未知的图片类型');
  const AttachmentModel = mongoose.model('attachments');
  const ForumModel = mongoose.model('forums');
  const FILE = require('../nkcModules/file');
  const ext = await FILE.getFileExtension(file, ['jpg', 'jpeg', 'png']);
  const time = new Date();
  const aid = await AttachmentModel.getNewId();
  let images;
  const updateObj = {};
  if(type === 'forumLogo') {
    updateObj.logo = aid;
    images = [
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: 192,
        width: 192,
        quality: 90
      },
      {
        type: 'lg',
        name: `${aid}_lg.${ext}`,
        height: 600,
        width: 600,
        quality: 90
      },
      {
        type: 'sm',
        name: `${aid}_sm.${ext}`,
        height: 48,
        width: 48,
        quality: 90
      }
    ];
  } else {
    updateObj.banner = aid;
    images = [
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: 300,
        width: 1200,
        quality: 90
      }
    ];
  }
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    ext,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type: 'forumLogo',
    images
  });
  await ForumModel.updateOne({fid}, {
    $set: updateObj
  });
  return attachment;
};
/*
* 保存积分的图标
* @param {File} file 图片文件
* @param {String} scoreType 积分类型
* @return {Object} attachment object
* @author pengxiguaa 2021/11/16
* */
schema.statics.saveScoreIcon = async (file, scoreType) => {
  const AttachmentModel = mongoose.model('attachments');
  const SettingModel = mongoose.model('settings');
  const FILE = require('../nkcModules/file');
  const ext = await FILE.getFileExtension(file, ['png', 'jpg', 'jpeg']);
  const aid = AttachmentModel.getNewId();
  const time = new Date();
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    ext,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type: 'scoreIcon',
    images: [
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: 128,
        width: 128,
        quality: 90
      },
      {
        type: 'sm',
        name: `${aid}_sm.${ext}`,
        height: 48,
        width: 48,
        quality: 90
      }
    ]
  });
  const scores = await SettingModel.getScores();
  for(const score of scores) {
    if(score.type === scoreType) {
      score.icon = aid;
      break;
    }
  }
  await SettingModel.updateOne({_id: 'score'}, {
    $set: {
      'c.scores': scores
    }
  });
  await SettingModel.saveSettingsToRedis('score');
  return attachment;
};

/*
* 保存文章封面
* @param {String} pid post id
* @param {File} file 文件对象 可选 默认从post resources中选取图片
* @author pengxiguaa 2020/7/21
* */
schema.statics.savePostCover = async (pid, file) => {
  const PostModel = mongoose.model('posts');
  const ResourceModel = mongoose.model('resources');
  const AttachmentModel = mongoose.model('attachments');
  const downloader = require('../tools/downloader');
  const FILE = require('../nkcModules/file');
  const post = await PostModel.findOne({pid});
  if(!post) return;
  if(file === undefined) {
    const extArr = ['jpg', 'jpeg', 'png'];
    const cover = await ResourceModel.findOne({ext: {$in: extArr}, references: pid});
    if(!cover) return;
    try{
      const {url} = await cover.getRemoteFile();
      file = await downloader(url);
    } catch(err) {
      return;
    }
  }
  const time = new Date();
  const aid = await AttachmentModel.getNewId();
  const ext = await FILE.getFileExtension(file, ['jpeg', 'jpg', 'png']);
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    ext,
    uid: post.uid,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type: 'postCover',
    images: [
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: 400,
        width: 800,
        background: '#ffffff',
        quality: 90
      }
    ]
  });
  await PostModel.updateOne({pid}, {
    $set: {
      cover: attachment._id,
    }
  });
};

/*
* 保存首页推荐文章封面
* @param {File} File 文件对象
* @param {String} type 图片类型 movable: 轮播图, fixed: 固定图
* @return {String} 附件对象ID
* @author pengxiguaa 2020/7/21
* */
schema.statics.saveRecommendThreadCover = async (file, type) => {
  const AttachmentModel = mongoose.model('attachments');
  const FILE = require('../nkcModules/file');
  const time = new Date();
  const aid = await AttachmentModel.getNewId();
  const ext = await FILE.getFileExtension(file, ['jpg', 'jpeg', 'png']);
  let height = 253, width = 400;
  if(type === 'movable') {
    height = 336;
    width = 800;
  }
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    ext,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type: 'recommendThreadCover',
    images: [
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height,
        width,
        quality: 90
      }
    ]
  });
  return attachment._id;
};

/*
* 修改draft的封面图
* @param {String} did draftID
* @param {File} 图片数据
* @author pengxiguaa 2020-8-3
* */
schema.statics.saveDraftCover = async (did, file) => {
  const DraftModel = mongoose.model('draft');
  const AttachmentModel = mongoose.model('attachments');
  const FILE = require('../nkcModules/file');
  const draft = await DraftModel.findOne({did});
  if(!draft) return;
  const ext = await FILE.getFileExtension(file, ['jpg', 'png', 'jpeg']);
  const time = new Date();
  const aid = await AttachmentModel.getNewId();
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    ext,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type: 'postCover',
    images: [
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: 400,
        width: 800,
        background: '#ffffff',
        quality: 90
      }
    ]
  });
  await draft.updateOne({cover: attachment._id});
};

/*
* 保存上报问题中的图片
* @param {Number} _id 问题 ID
* @param {[File]} 图片文件对象组成的数组
* */
schema.statics.saveProblemImages = async (_id, files = []) => {
  const ProblemModel = mongoose.model('problems');
  const AttachmentModel = mongoose.model('attachments');
  const FILE = require('../nkcModules/file');
  const problem = await ProblemModel.findOne({_id});
  if(!problem) throwErr(500, `图片保存失败`);
  let attachId = [];
  const time = new Date();
  for(const file of files) {
    let ext;
    try{
      ext = await FILE.getFileExtension(file, ['jpg', 'jpeg', 'png']);
    } catch(err) {
      continue;
    }
    const aid = await AttachmentModel.getNewId();
    const attachment = await AttachmentModel.createAttachmentAndPushFile({
      aid,
      file,
      ext,
      type: 'problemImage',
      sizeLimit: 50 * 1024 * 1024,
      time,
      images: [
        {
          type: 'def',
          name: `${aid}.${ext}`,
          height: 1080,
          width: 1920,
          quality: 95
        },
        {
          type: 'sm',
          name: `${aid}_sm.${ext}`,
          height: 200,
          width: 200,
          background: '#ffffff',
          quality: 90
        }
      ]
    });
    attachId.push(attachment._id);
  }
  await problem.updateOne({attachId});
};



/*
* 保存基金项目的图片
* @param {String} filePath 图片的路径
* @param {String} type 图片的类型 fundAvatar, fundBanner
* @return {String} 附件ID
* */
schema.statics.saveFundImage = async (file, type) => {
  if(!['fundAvatar', 'fundBanner'].includes(type)) throw new Error(`fund image type error`);
  const AttachmentModel = mongoose.model('attachments');
  const FILE = require('../nkcModules/file');
  const ext = await FILE.getFileExtension(file, ['jpg', 'png', 'jpeg']);
  const aid = await AttachmentModel.getNewId();
  const time = new Date();
  const imageSize = type === 'fundAvatar'? [600, 300]: [1500, 250]
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    ext,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type,
    images: [
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: imageSize[1],
        width: imageSize[0],
        quality: 90
      }
    ]
  });
  return attachment._id;
}

/*
* 更新用户的背景
* @param {String} uid 用户 ID
* @param {File} file
* @return {Object} attachment 对象
* */
schema.statics.saveUserAvatar = async (uid, file) => {
  const AttachmentModel = mongoose.model('attachments');
  const UserModel = mongoose.model('users');
  const time = new Date();
  const FILE = require('../nkcModules/file');
  const aid = await AttachmentModel.getNewId();
  const ext = await FILE.getFileExtension(file, ['jpg', 'png', 'jpeg']);
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    uid,
    ext,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type: 'userAvatar',
    images: [
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: 192,
        width: 192,
        quality: 90
      },
      {
        type: 'sm',
        name: `${aid}_sm.${ext}`,
        height: 48,
        width: 48,
        quality: 90
      },
      {
        type: 'lg',
        name: `${aid}_lg.${ext}`,
        height: 600,
        width: 600,
        quality: 90
      }
    ]
  });
  await UserModel.updateOne({uid}, {
    $set: {
      avatar: attachment._id
    }
  });
  return attachment;
};

/*
* 更新用户的背景
* @param {String} uid 用户 ID
* @param {File} file
* @return {Object} attachment 对象
* */
schema.statics.saveUserBanner = async (uid, file) => {
  const AttachmentModel = mongoose.model('attachments');
  const UserModel = mongoose.model('users');
  const time = new Date();
  const aid = await AttachmentModel.getNewId();
  const FILE = require('../nkcModules/file');
  const ext = await FILE.getFileExtension(file, ['jpeg', 'png', 'jpg']);
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    ext,
    uid,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type: 'userBanner',
    images: [
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: 400,
        width: 800,
        quality: 95
      }
    ]
  });
  await UserModel.updateOne({uid}, {
    $set: {
      banner: attachment._id
    }
  });
  return attachment;
};

/*
* 保存专栏头像
* @param {Number} columnId 专栏 ID
* @param {File} file 文件对象
* @return {Object} attachment 对象
* */
schema.statics.saveColumnAvatar = async (columnId, file) => {
  const AttachmentModel = mongoose.model('attachments');
  const ColumnModel = mongoose.model('columns');
  const ImageLogModel = mongoose.model('imageLogs');
  const column = await ColumnModel.findOnly({_id: columnId});
  const time = new Date();
  const aid = await AttachmentModel.getNewId();
  const FILE = require('../nkcModules/file');
  const ext = await FILE.getFileExtension(file, ['jpeg', 'png', 'jpg']);
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    ext,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type: 'columnAvatar',
    images: [
      {
        type: 'sm',
        name: `${aid}_sm.${ext}`,
        height: 100,
        width: 100,
        quality: 90
      },
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: 250,
        width: 250,
        quality: 90
      },
      {
        type: 'lg',
        name: `${aid}_lg.${ext}`,
        height: 500,
        width: 500,
        quality: 90
      }
    ]
  });
  await ColumnModel.updateOne({_id: columnId}, {
    $set: {
      avatar: attachment._id
    }
  });
  const imgTypes = ["columnAvatar", "columnAvatarSM", "columnAvatarLG"];
  for(const imgType of imgTypes) {
    const log = await ImageLogModel({
      uid: column.uid,
      columnId,
      imgType,
      imgId: aid,
      type: "columnChangeAvatar"
    });
    await log.save();
  }
  return attachment;
}

/*
* 保存专栏背景
* @param {Number} columnId 专栏 ID
* @param {File} file 文件对象
* @return {Object} attachment 对象
* */
schema.statics.saveColumnBanner = async (columnId, file) => {
  const AttachmentModel = mongoose.model('attachments');
  const ColumnModel = mongoose.model('columns');
  const ImageLogModel = mongoose.model('imageLogs');
  const column = await ColumnModel.findOnly({_id: columnId});
  const time = new Date();
  const aid = await AttachmentModel.getNewId();
  const FILE = require('../nkcModules/file');
  const ext = await FILE.getFileExtension(file, ['jpeg', 'png', 'jpg']);
  const attachment = await AttachmentModel.createAttachmentAndPushFile({
    aid,
    file,
    ext,
    sizeLimit: 20 * 1024 * 1024,
    time,
    type: 'columnAvatar',
    images: [
      {
        type: 'sm',
        name: `${aid}_sm.${ext}`,
        height: 720,
        width: 1280,
        quality: 90
      },
      {
        type: 'def',
        name: `${aid}.${ext}`,
        height: 480,
        width: 1920,
        quality: 90
      }
    ]
  });
  await ColumnModel.updateOne({_id: columnId}, {
    $set: {
      banner: attachment._id
    }
  });
  const imgTypes = ["columnBanner", "columnBannerSM"];
  for(const imgType of imgTypes) {
    const log = await ImageLogModel({
      uid: column.uid,
      columnId,
      imgType,
      imgId: aid,
      type: "columnChangeBanner"
    });
    await log.save();
  }
  return attachment;
}

/*
* 创建 attachment 记录并推送文件到 media service 处理
* @param {String} aid attachment ID
* @param {File} file 文件对象
* @param {String} ext 文件格式
* @param {String} uid 上传者 ID
* @param {Number} sizeLimit 图片尺寸限制 字节
* @param {Date} time 上传时间
* @param {String} type attachment 类型 例如：userAvatar, userBanner 等等
* @param {[Object]} images 待生成的图片信息
*   @param {String} type 同一图片的类型 例如：def, sm, lg
*   @param {String} filename 文件在 store service 上的文件名
*   @param {Number} height 压缩后的图片高
*   @param {Number} width 压缩后的图片宽
*   @param {Number} quality 压缩后的图片质量 1 - 100
* */
schema.statics.createAttachmentAndPushFile = async (props) => {
  const {
    aid,
    file,
    ext,
    uid,
    sizeLimit = 0,
    time,
    type,
    images = []
  } = props;
  const AttachmentModel = mongoose.model('attachments');
  const {getSize} = require('../nkcModules/tools');
  const FILE = require('../nkcModules/file');
  if(file.size > sizeLimit) throwErr(400, `文件不能超过 ${getSize(sizeLimit, 0)}`);
  const attachment = AttachmentModel({
    _id: aid,
    toc: time,
    size: file.size,
    name: file.name,
    hash: file.hash,
    ext,
    type,
    uid
  });
  const files = await attachment.pushToMediaService(file.path, images);
  attachment.files = FILE.filterFilesInfo(files);
  await attachment.save();
  return attachment;
};



/*
* 推送文件到 media service 处理
* @param {String} filePath 待处理文件路径
* @param {[Object]} images 需要处理并生成的图片的信息
*   @param {String} type 同一图片的类型 例如：def, sm, lg
*   @param {String} filename 文件在 store service 上的文件名
*   @param {Number} height 压缩后的图片高
*   @param {Number} width 压缩后的图片宽
*   @param {Number} quality 压缩后的图片质量 1 - 100
* @return {Object} media service 处理之后生成的文件信息
* */
schema.methods.pushToMediaService = async function(filePath, images) {
  const FILE = require('../nkcModules/file');
  const socket = require('../nkcModules/socket');
  const mediaClient = require('../tools/mediaClient');
  const {toc, type, _id} = this;
  const storeServiceUrl = await FILE.getStoreUrl(toc);
  const mediaServiceUrl = await socket.getMediaServiceUrl();
  const timePath = await FILE.getTimePath(toc);
  const mediaPath = await FILE.getMediaPath(type);
  const data = {
    aid: _id,
    timePath,
    mediaPath,
    toc,
    images
  };
  const res = await mediaClient(mediaServiceUrl, {
    type: 'attachment',
    filePath,
    storeUrl: storeServiceUrl,
    data
  });
  return res.files;
}

/*
* 加载从 store service 取文件需要的数据
* @param {String} size 同一文件的不同类型
* @return {Object}
*   @param {String} url store service 链接
*   @param {String} filename 下载时的文件名称，设置在 response header 中
*   @param {Object} query
*     @param {String} path 文件在 store service 上的路径
*     @param {Number} time 文件的上传时间
* */
schema.methods.getRemoteFile = async function(size = 'def') {
  const FILE = require('../nkcModules/file');
  const {_id, toc, type, name, files = {}, ext} = this;
  return await FILE.getRemoteFile({
    id: _id,
    toc,
    ext,
    type,
    name,
    file: files[size] || files['def']
  });
}

schema.methods.updateFilesInfo = async function() {
  const FILE = require('../nkcModules/file');
  const {toc, type, _id, ext} = this;
  const files = await FILE.getStoreFilesInfoObj(toc, type, {
    def: `${_id}.${ext}`,
    sm: `${_id}_sm.${ext}`,
    lg: `${_id}_lg.${ext}`,
    md: `${_id}_md.${ext}`,
  });
  console.log(JSON.stringify(files, '', 2));
  await this.updateOne({
    $set: {
      files
    }
  });
};

module.exports = mongoose.model('attachments', schema);
