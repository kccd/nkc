const settings = require('../settings');
const cheerio = require('cheerio');
const mongoose = settings.database;
const Schema = mongoose.Schema;

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
    required: true
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
  }
});
/* 
  获取文件路径
*/
resourceSchema.methods.getFilePath = async function() {
  const {selectDiskCharacterDown} = require("../settings/mediaPath");
  const {path} = this;
  let filePath = selectDiskCharacterDown(this);
  filePath += path;
  return filePath;
};

// 存储文章中的nkcsource
resourceSchema.statics.toReferenSource = async function(id, declare) {
  let model = mongoose.model("resources")
	let $ = cheerio.load(declare);
	$("nkcsource").each(async (index, el) => {
		let $el = $(el);
		let type = $el.attr("data-type");
		if(!["audio", "video", "picture", "attachment"].includes(type)) return;
		let rid = $el.attr("data-id");
		let resource = await model.findOne({rid: rid});
		if(!resource) return;
		await resource.update({
			$addToSet: {
				references: id
			}
		});
		// console.log("forum:" + fid + " referened to resource:" + rid);
	})
}


// 查找一个post引用的所有source
resourceSchema.statics.getResourcesByReference = async function(id) {
  let model = mongoose.model("resources");
  return await model.find({references: id});
}


module.exports = mongoose.model('resources', resourceSchema);