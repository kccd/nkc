const mongoose = require('mongoose');
const {getUrl, fromNow} = require("../nkcModules/tools");
const videoSize = require("../settings/video");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 原文类型
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 原文ID
  targetId: {
    type: String,
    required: true,
    index: 1
  },
  content: {
    type: String,
    index: 1,
    default: ''
  },
  // cid不为null, 则词记录是历史
  cid: {
    type: Number,
    default: null,
    index: 1
  },
  // 选区ID
  noteId: {
    type: Number,
    required: true,
    index: 1
  },
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  deleted: {
    type: Boolean,
    default: false,
    index: 1
  },
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  status:{
    type: String,
    default: 'normal',
    index: 1
  }
}, {
  collection: "noteContent"
});


const noteContentStatus = {
  disabled : "disabled",//屏蔽
  unknown  : "unknown",//未审核
  normal   : "normal", //正常状态
  deleted  :  "deleted" , //管理员只操作前面三种状态，最后一种仅限于提供给用户使用
};

/*
* 拓展笔记的创建者、渲染内容。
* @param {[Object]} noteContent 笔记内容对象组成的数组
* @return {[Object]} 拓展user后的数据
* @author pengxiguaa 2020-3-12
* */
schema.statics.extendNoteContent = async (noteContent, options = {}) => {
  const {extendNote} = options;
  const isArr = Array.isArray(noteContent);
  if(!isArr) {
    noteContent = [noteContent];
  }
  const {plainEscape} = require("../nkcModules/nkcRender");
  const UserModel = mongoose.model("users");
  const usersId = [], usersObj = {}, notesId = [], notesObj = {};
  noteContent.map(n => {
    usersId.push(n.uid);
    if(extendNote) notesId.push(n.noteId);
  });
  const users = await UserModel.find({uid: {$in: usersId}});
  users.map(user => usersObj[user.uid] = user);
  if(extendNote) {
    const notes = await mongoose.model("notes").find({originId: {$in: notesId}, latest: true});
    notes.map(note => {
      notesObj[note.originId] = note
    });
  }
  const result = [];
  for(let c of noteContent) {
    if(c.toObject) c = c.toObject();
    c.user = usersObj[c.uid];
    c.html = plainEscape(c.content);
    if(extendNote) {
      c.note = notesObj[c.noteId];
      if(c.note.type === "post") {
        c.url = `/p/${c.note.targetId}`;
      }
    }
    result.push(c);
  }
  if(!isArr) return result[0];
  return result;
};

/*
* 复制一份到数据库，添加cid字段表示该数据为cid对应内容的历史
* */
//appear为新创建的字段，主要是为了检测笔记编辑过后的敏感词
schema.methods.cloneAndUpdateContent = async function(content, appear) {
  if(this.content === content) return;
  const NoteContentModel = mongoose.model("noteContent");
  const nc = this.toObject();
  const tlm = Date.now();
  delete nc._id;
  delete nc.__v;
  nc._id = await mongoose.model("settings").operateSystemID("noteContent", 1);
  nc.cid = this._id;
  nc.tlm = tlm;
  nc.deleted = true;
  nc.status = noteContentStatus.deleted;
  const newNodeContent = NoteContentModel(nc);
  await newNodeContent.save();
  if(appear){
    await this.updateOne({
      content,
      tlm,
      status: noteContentStatus.unknown
    });
  }
  else {
    await this.updateOne({
      content,
      tlm,
      status: noteContentStatus.normal
    });
  }
};
//获取笔记的引用类型
schema.statics.getNoteContentStatus = async () => {
  return {
    ...noteContentStatus
  };
}

schema.statics.extendMomentsData = async (moments, uid = '', field = '_id') => {
  const videoSize = require('../settings/video');
  const UserModel = mongoose.model('users');
  const ResourceModel = mongoose.model('resources');
  const MomentModel = mongoose.model('moments');
  const DocumentModel = mongoose.model('documents');
  const PostsVoteModel = mongoose.model('postsVotes');
  const {getUrl, fromNow} = require('../nkcModules/tools');
  const IPModel = mongoose.model('ips');
  const localAddr = await IPModel.getLocalAddr();
  const {moment: momentSource} = await DocumentModel.getDocumentSources();
  const momentStatus = await MomentModel.getMomentStatus();
  const usersId = [];
  const momentsId = [];
  let resourcesId = [];
  for(const moment of moments) {
    const {
      uid,
      files,
      _id,
    } = moment;
    usersId.push(uid);
    resourcesId = resourcesId.concat(files);
    momentsId.push(_id);
  }
  // 准备用户数据
  const usersObj = await UserModel.getUsersObjectByUsersId(usersId);
  // 准备附件数据
  const resourcesObj = await ResourceModel.getResourcesObjectByResourcesId(resourcesId);
  // 准备动态内容
  const stableDocumentsObj = await DocumentModel.getStableDocumentsBySource(momentSource, momentsId, 'object');
  // 点赞内容
  const {moment: momentVoteSource} = await PostsVoteModel.getVoteSources();
  
  const votesType = await PostsVoteModel.getVotesTypeBySource(
    momentVoteSource,
    momentsId,
    uid
  );
  
  const results = {};
  for(const moment of moments) {
    const {
      uid,
      files,
      top,
      _id,
      voteUp,
      order,
      comment,
      commentAll,
      repost,
      quoteType,
      status,
    } = moment;
    
    let f = moment[field];
    const user = usersObj[uid];
    if(!user) continue;
    const {username, avatar} = user;
    const betaDocument = stableDocumentsObj[_id];
    let content = '';
    let addr = localAddr;
    if(betaDocument) {
      const originalContent = await betaDocument.renderAtUsers();
      content = await MomentModel.renderContent(originalContent || betaDocument.content);
      addr = betaDocument.addr;
    }
    
    if(!content && quoteType) {
      content = await MomentModel.getQuoteDefaultContent(quoteType);
    }
    
    const filesData = [];
    for(const rid of files) {
      const resource = resourcesObj[rid];
      if(!resource) continue;
      await resource.setFileExist();
      const {
        mediaType,
        defaultFile,
        disabled,
        isFileExist,
        visitorAccess,
        mask,
      } = resource;
      let fileData;
      
      if(mediaType === 'mediaPicture') {
        const {
          height,
          width,
          name: filename
        } = defaultFile;
        fileData = {
          rid,
          type: 'picture',
          url: getUrl('resource', rid),
          height,
          width,
          filename,
          disabled,
          lost: !isFileExist,
        };
      } else {
        const {name: filename} = defaultFile;
        const sources = [];
        for(const {size, dataSize} of resource.videoSize) {
          const {height} = videoSize[size];
          const url = getUrl('resource', rid, size) + '&w=' + resource.token;
          sources.push({
            url,
            height,
            dataSize,
          });
        }
        fileData = {
          rid: rid,
          type: 'video',
          coverUrl: getUrl('resource', rid, 'cover'),
          visitorAccess,
          mask,
          sources,
          filename,
          disabled,
          lost: !isFileExist,
        };
      }
      
      filesData.push(fileData);
    }
    results[f] = {
      momentId: _id,
      uid,
      user,
      username,
      avatarUrl: getUrl('userAvatar', avatar),
      userHome: getUrl('userHome', uid),
      time: fromNow(top),
      toc: top,
      content,
      voteUp,
      status,
      addr,
      statusInfo: '',
      voteType: votesType[_id],
      commentCount: commentAll,
      repostCount: repost,
      source: 'moment',
      files: filesData,
      url: getUrl('zoneMoment', _id),
    };
    
    if(moment.status !== momentStatus.normal) {
      let momentContent = '';
      switch (moment.status) {
        case momentStatus.disabled: {
          momentContent = '内容已屏蔽';
          break;
        }
        case momentStatus.faulty: {
          momentContent = '内容已退回修改';
          break;
        }
        case momentStatus.unknown: {
          momentContent = '内容待审核';
          break;
        }
        case momentStatus.deleted: {
          momentContent = '内容已删除';
          break;
        }
        default: {
          momentContent = '内容暂不予显示';
        }
      }
      // 待改，此处返回的字段之后两个字段，应包含全部字段，只不过字段内容为空
      results[f].statusInfo = momentContent;
    }
    
  }
  return results;
};



module.exports = mongoose.model("noteContent", schema);
