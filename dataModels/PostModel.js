const settings = require('../settings');
const PATH = require('path');
const nkcRender = require('../nkcModules/nkcRender');
const {htmlToPlain, renderHTML} = nkcRender;
const customCheerio = require('../nkcModules/nkcRender/customCheerio');
const {getQueryObj, obtainPureText} = require('../nkcModules/apiFunction');
const mongoose = settings.database;
const {Schema} = mongoose;
// const {indexPost, updatePost} = settings.elastic;
const postSchema = new Schema({
  // post id
  pid: {
    type: String,
    unique: true,
    required: true
  },
  // 已经@过的用户
  atUsers: {
    type: [Schema.Types.Mixed],
    default: []
  },
  // 富文本内容
  c: {
    type: String,
    default: ''
  },
  // 旧 平学术分和科创币
  credits: {
    type: [Schema.Types.Mixed],
    default: []
  },
  // 是否被屏蔽
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
	// 是否被退回修改。true: 被退回， false: 被彻底屏蔽
	toDraft: {
		type: Boolean,
		default: null,
		index: 1
	},
  // 创建者的ip
  ipoc: {
    type: String,
    default: '0.0.0.0'
  },
  // 修改者的ip
  iplm: {
    type: String,
  },
  // 旧 内容格式，数据统一成了html
  l: {
    type: String,
    default: "html",
  },
  // 旧 收藏的用户
  recUsers: {
    type: [String],
	  index: 1,
    default: []
  },
  // 旧 引用的PID
  rpid: {
    type: [String],
    default: []
  },
  // 引用的post id
  quote: {
    type: String,
    default: ""
  },
  // 所有上级post
  parentPostsId: {
    type: [String],
    default: [],
    index: 1
  },
  // 上级post
  parentPostId: {
    type: String,
    default: '',
    index: 1
  },
  // 下一级post数目
  postCount: {
    type: Number,
    default: 0
  },
  // 作为文章内容时，文章下所有回复的数量，包含封禁的回复
  threadPostCount: {
    type: Number,
    index: 1,
    default: 0,
  },
  // 标题
  t: {
    type: String,
    default: ''
  },
  // 主要分类
  mainForumsId: {
    type: [String],
    default: [],
    index: 1
  },
  // 辅助分类
  minorForumsId: {
    type: [String],
    default: [],
    index: 1
  },
  // 自定义分类
  customForumsId: {
    type: [String],
    default: [],
    index: 1
  },
  // 所属文章ID
  tid: {
    type: String,
    required: true,
    index: 1
  },
  // 创建的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 修改的时间
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 发表者ID
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 修改者ID
  uidlm: {
    type: String,
    index: 1
  },
  // 旧 文章是否有图
  hasImage: {
    type: Boolean,
    index: 1,
    default: false
  },
  // 是否隐藏历史记录
	hideHistories: {
  	type: Boolean,
		default: false
	},
  // 是否加精
	digest: {
  	type: Boolean,
		default: false,
		index: 1
	},
  // 加精的时间
  digestTime: {
    type: Date,
    default: null,
    index: 1
  },
  // 支持数
  voteUp: {
    type: Number,
    index: 1,
    default: 0
  },
  // 支持数 包含回复，不包含评论
  voteUpTotal: {
    type: Number,
    default: 0,
    index: 1,
  },
  // 反对数
  voteDown: {
    type: Number,
    index: 1,
    default: 0
  },
  // 反对数 包含回复，不包含评论
  voteDownTotal: {
    type: Number,
    default: 0,
    index: 1,
  },
  // 中文摘要
  abstractCn: {
    type: String,
    default: ""
  },
  // 英文摘要
  abstractEn: {
    type: String,
    default: ""
  },
  // 中文关键词
  keyWordsCn: {
    type: Array,
    default: []
  },
  // 英文关键词
  keyWordsEn: {
    type: Array,
    default: []
  },
  // 作者信息
  authorInfos: {
    type: Array,
    default: []
  },
  // 原创声明
  originState: {
    type: String,
    index: 1,
    default: "0"
  },
  // 是否已经审核
  reviewed: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 是否匿名
  anonymous: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 投票功能表单的ID
  surveyId: {
    type: Number,
    default: null,
    index: 1
  },
  // 封面图图片hash
  cover: {
    type: String,
    default: ""
  },
  // post类型 thread: 文章内容，post: 回复内容
  type: {
    type: String,
    default: "post",
    index: 1
  },
  // 折叠 not: 不折叠, half: 半折叠, all: 全折叠, null: 默认（具体是否折叠需要根据回复的情况判断）
  hide: {
    type: String,
    default: "null"
  },
  // 内容对版本
  cv: {
    type: Number,
    default: 1
  },
  // 是否开启流控
  flowControl: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 有关下级评论的控制
  comment: {
    type: String, // 'r': 可查看, 'rw': 可看看可评论, 'n': 不可看不可评论
    default: 'rw',
  }
}, {toObject: {
  getters: true,
  virtuals: true
}});

// 标志 表示是否禁止划词选区的更新 默认为false
postSchema.virtual('disableNoteUpdate')
  .get(function() {
    return this._disableNoteUpdate
  })
  .set(function(disableNoteUpdate) {
    this._disableNoteUpdate = disableNoteUpdate
  });

postSchema.virtual('reason')
  .get(function() {
    return this._reason
  })
  .set(function(reason) {
    this._reason = reason
  });

postSchema.virtual('url')
  .get(function() {
    return this._url
  })
  .set(function(url) {
    this._url = url
  });

postSchema.virtual('ownPost')
  .get(function() {
    return this._ownPost
  })
  .set(function(ownPost) {
    this._ownPost = ownPost
  });

postSchema.virtual('hidePost')
  .get(function() {
    return this._ownPost
  })
  .set(function(ownPost) {
    this._ownPost = ownPost
  });

postSchema.virtual('user')
  .get(function() {
    return this._user
  })
  .set(function(u) {
    this._user = u
  });

postSchema.virtual('resources')
  .get(function() {
    return this._resources
  })
  .set(function(rs) {
    this._resources = rs
  });

postSchema.virtual('thread')
  .get(function() {
    return this._thread
  })
  .set(function(t) {
    this._thread = t
  });
postSchema.virtual('usersVote')
  .get(function() {
    return this._usersVote
  })
  .set(function(t) {
    this._usersVote = t
  });

postSchema.methods.extendThread = async function() {
  const ThreadModel = mongoose.model('threads');
  return this.thread = await ThreadModel.findOnly({tid: this.tid})
};

postSchema.methods.extendResources = async function() {
  const ResourceModel = mongoose.model('resources');
  return this.resources = await ResourceModel.find({references: this.pid})
};

postSchema.methods.extendUser = async function() {
  const UserModel = mongoose.model('users');
  return this.user = await UserModel.findOnly({uid: this.uid});
};

postSchema.methods.ensurePermissionNew = async function(options) {
	await this.thread.ensurePermission(options);
	const {isModerator, userOperationsId, uid} = options;
	if(this.disabled) {
		if(!isModerator) {
			if(this.toDraft && !userOperationsId.includes('displayRecycleMarkThreads')) {
				if(!uid || uid.uid !== this.uid) {
					const err = new Error('权限不足');
					err.status = 403;
					throw err;
				}
			}
			if(!this.toDraft && !userOperationsId.includes('displayDisabledPosts')) {
				const err = new Error('权限不足');
				err.status = 403;
				throw err;
			}
		}
	}
};

postSchema.methods.ensurePermission = async function(options) {
  const {isModerator, userOperationsId, user, roles, grade} = options;
  await this.thread.ensurePermission(roles, grade, user);
  const uid = user?user.uid: '';
  if(this.disabled) {
    if(!isModerator) {
      if(this.toDraft && !userOperationsId.includes('displayRecycleMarkThreads')) {
        if(!uid || uid.uid !== this.uid) {
          const err = new Error('权限不足');
          err.status = 403;
          throw err;
        }
      }
      if(!this.toDraft && !userOperationsId.includes('displayDisabledPosts')) {
        const err = new Error('权限不足');
        err.status = 403;
        throw err;
      }
    }
  }
};


//
postSchema.pre('save' , function(next) {
  if(!this.iplm) {
    this.iplm = this.ipoc;
  }
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  if(!this.uidlm) {
    this.uidlm = this.uid;
  }
  next();
});
/*
* 去掉内容中的笔记选区标记
* 若内容有变动则内容版本号加一并复制选区信息并更新
* */
postSchema.pre("save", async function(next) {
  // 判断文本是否有变化，有变化版本号加1
  const PostModel = mongoose.model("posts");
  const NoteModel = mongoose.model("notes");
  const SettingModel = mongoose.model("settings");
  const {getMark} = require("../nkcModules/nkcRender/markNotes");
  // 去掉插入post中的选区标记
  // 重新计算选区信息
  const {html, notes} = getMark(this.c);
  // 将去掉选区标记后的内容存到数据库
  // 与更改前的内容比较
  // 如果有改动则更新选区信息
  const _post = await PostModel.findOne({pid: this.pid}, {c: 1});
  if(!_post) return await next();
  this.c = html;
  if(this.c !== _post.c) {
    const oldCV = this.cv;
    this.cv ++;
    if(!this.disableNoteUpdate) {
      // 内容版本号加一（与选区版本对应）
      // 更新选区信息
      const notesObj = {}, notesId = [];
      notes.map(note => {
        notesObj[note._id] = note;
        notesId.push(note._id);
      });
      const markNotesObj = {};
      const markNotes = await NoteModel.find({_id: {$in: notesId}});
      markNotes.map(n => {
        const {_id, originId} = n;
        const note = notesObj[_id];
        note.originId = originId;
        markNotesObj[n.originId] = note;
      });

      const _notes  = await NoteModel.getNotesByPost({
        pid: this.pid,
        cv: oldCV
      });
      const notesDB = _notes.notes;
      for(const _noteDB of notesDB) {
        let noteDB = _noteDB.toObject();
        const newNote = markNotesObj[noteDB.originId];
        delete noteDB._id;
        delete noteDB.toc;
        delete noteDB.__v;
        noteDB.latest = true;
        noteDB.node.offset = 0;
        noteDB.node.length = 0;
        if(newNote) {
          noteDB.node.offset = newNote.offset || 0;
          noteDB.node.length = newNote.length || 0;
          noteDB.node.newContent = newNote.content || "";
        }
        noteDB.cv = this.cv;
        noteDB._id = await SettingModel.operateSystemID("notes", 1);
        noteDB = NoteModel(noteDB);
        // 存入新的选区
        await _noteDB.updateOne({latest: false});
        await noteDB.save();
      }
    }
  }
  await next();
});

//
/*
postSchema.pre("save", async function(next) {
  this.c = nkcRender.renderHTML({
    type: "data",
    post: this
  });
  await next();
});
*/

// 解析@信息
postSchema.pre('save', async function(next) {
  const UserModel = mongoose.model('users');
  const {c} = this;
  const atUsers = [];
  const atUsersId = [];
  const $ = customCheerio.load(c);
  const html = $('body')[0];
  const texts = [];
  const getNodesText = function(node) {
    if(!node.children || node.children.length === 0) return;
    for(let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      if(c.type === 'text') {
        if(c.data.length > 0) texts.push(c.data);
      } else if(c.type === 'tag') {
        if(['a', 'blockquote', 'code', 'pre'].includes(c.name)) continue;
        if(c.attribs['data-tag'] === 'nkcsource') continue;
        getNodesText(c);
      }
    }
  }
  // 获取文本内容，已排除掉特殊格dom中的文本
  getNodesText(html);

  for(let text of texts) {
    // 排除不包含@的内容
    if(!text.includes('@')) continue;
    text = text.toLowerCase();
    // 获取当前文本中@之后的文本
    const arr = text.split('@');
    // 去掉第@之前的文本
    arr.shift();
    for(let item of arr) {
      // 最多取@之后的30个字来判断是否为用户名
      item = item.slice(0, 30);
      // 去掉空格后边的字符
      item = item.split(' ')[0];
      // 排除空字符
      if(item.length === 0) continue;
      // 去数据库查询用户名是否存在
      const usernames = [];
      const textLength = item.length;
      for(let i = 1; i <= textLength; i++) {
        usernames.push(item.slice(0, i));
      }
      const targetUsers = await UserModel.find({usernameLowerCase: {$in: usernames}}, {username: 1, usernameLowerCase: 1, uid: 1});
      let user;
      // 取用户名最长的用户为目标用户
      for(const u of targetUsers) {
        if(user === undefined || user.username.length < u.username.length) {
          user = u;
        }
      }
      if(!user) continue;
      if(atUsersId.includes(user.uid)) continue;
      atUsersId.push(user.uid);
      atUsers.push({
        uid: user.uid,
        username: user.username
      });
    }
  }
  this.atUsers = atUsers;
  await next();
});

// 保存POST前检测内容是否有@
/*postSchema.pre('save', async function(next) {
  // analyzing the content(post.c) to find p.atUsers change
  try {
    const UserModel = mongoose.model('users');

    const {c} = this;
    const atUsers = []; //user info {username, uid}
    const existedUsers = []; //real User mongoose data model
    // 截取所有@起向后15字符的字符串
    var positions = [];
    // 引用的内容再次发布，不解析at
    let e = c.replace(/<blockquote.*?blockquote>/im,'');
    e = e.replace(/<code\s[\s\S]*?<\/code>/ig, "").replace(/<pre\s[\s\S]*?<\/pre>/ig, "");
    var d = e.replace(/<[^>]+>/g,"");
    var pos = d.indexOf("@");
    while(pos > -1){
      positions.push(d.substr(pos+1, 30));
      pos = d.indexOf("@",pos+1)
    }
    // 验证每个@是否含有特殊字符
    for(var i = 0; i < positions.length; i++){
      var atPos = positions[i].indexOf("@"); // @符号位置
      var semiPos = positions[i].indexOf(";"); // 分号位置
      var colonPos = positions[i].indexOf(":"); // 冒号位置
      var ltPos = positions[i].indexOf("<"); // 左尖括号位置
      var comPos = positions[i].indexOf("，"); // 逗号位置
      var perPos = positions[i].indexOf("。"); // 句号位置
      var spacePos = positions[i].indexOf(" "); // 空格位置
      if(atPos > -1){
        positions[i] = positions[i].substr(0,atPos)
      }else if(semiPos > -1){
        positions[i] = positions[i].substr(0,semiPos)
      }else if(colonPos > -1){
        positions[i] = positions[i].substr(0,colonPos)
      }else if(ltPos > -1){
        positions[i] = positions[i].substr(0,ltPos)
      }else if(comPos > -1){
        positions[i] = positions[i].substr(0,comPos)
      }else if(perPos > -1){
        positions[i] = positions[i].substr(0,perPos)
      }else if(spacePos > -1) {
        positions[i] = positions[i].substr(0,spacePos)
      }
      // 用户名从最后一个字符开始，逐个向前在数据库中查询
      var evePos = positions[i].toLowerCase();
      // 用户名至少含有一个字符，不可以为空
      if(evePos === "") {
        positions.splice(i, 1);
        break;
      }
      for(var num = evePos.length;num >= 0;num--){
        var factName = await UserModel.findOne({usernameLowerCase:evePos.substr(0,num)});
        if(factName && factName.username !== ""){
          // positions[i] = factName.username;
          positions[i] = positions[i].substr(0,num);
          break;
        }
        if(num === 0 && factName === null){
          // positions[i] = "@科创论坛";
          positions.splice(i,0)
        }
      }
    }
    // 这是之前的，先屏蔽掉
    //  const matchedUsernames = c.match(/@([^@\s]*)\s/g);
    //  console.log(matchedUsernames)
    if (positions && positions.length) {
      await Promise.all(positions.map(async str => {
        // const username = str.slice(1, -1); //slice the @ and [\s] in reg
        const usernameLowerCase = str.toLowerCase();
        // console.log(username)
        const user = await UserModel.findOne({usernameLowerCase});
        if (user) {
          const {uid} = user;
          const username = str;
          let flag = true; //which means this user does not in existedUsers[]
          for (const u of atUsers) {
            if (u.username === username)
              flag = false;
          }
          if (flag) {
            atUsers.push({username, uid});
            existedUsers.push(user)
          }
        }
      }))
    }
    // 被AT用户名单
    this.atUsers = atUsers;
    return next()
  } catch(e) {
    return next(e)
  }
});*/

// postSchema.pre('save', async function(next) {
//   // analyzing the content(post.c) to find p.atUsers change

//   try {
//     const UserModel = mongoose.model('users');

//     const {c} = this;
//     const atUsers = []; //user info {username, uid}
//     const existedUsers = []; //real User mongoose data model
//     const matchedUsernames = c.match(/@([^@\s]*)\s/g);
//     if (matchedUsernames) {
//       await Promise.all(matchedUsernames.map(async str => {
//         const username = str.slice(1, -1); //slice the @ and [\s] in reg
//         const user = await UserModel.findOne({username});
//         if (user) {
//           const {username, uid} = user;
//           let flag = true; //which means this user does not in existedUsers[]
//           for (const u of atUsers) {
//             if (u.username === username)
//               flag = false;
//           }
//           if (flag) {
//             atUsers.push({username, uid});
//             existedUsers.push(user)
//           }
//         }
//       }))
//     }
//     this.atUsers = atUsers;
//     return next()
//   } catch(e) {
//     return next(e)
//   }
// });

postSchema.pre('save', async function(next) {
  // analyzing the content (post.c) and changing the
  // resource.references to make resource has a
  // correct reference to the post
  try {
    const ResourceModel = mongoose.model('resources');
    const {c, pid} = this;
    await ResourceModel.toReferenceSource(pid, c);
    return next()
  } catch(e) {
    return next(e)
  }
});

postSchema.statics.updateElasticSearch = async function(post) {
  const elasticSearch = require("../nkcModules/elasticSearch");
  const docType = post.type;
  await elasticSearch.save(docType, post);
};

/*
* 同步所有的post到es
* @author pengxiguaa 2020/7/7
* */
postSchema.statics.saveAllPostToElasticSearch = async function() {
  const PostModel = mongoose.model('posts');
  const count = await PostModel.countDocuments();
  const limit = 2000;
  for(let i = 0; i <= count; i+=limit) {
    const posts = await PostModel.find().sort({toc: 1}).skip(i).limit(limit);
    for(const post of posts) {
      await PostModel.updateElasticSearch(post);
    }
    console.log(`【同步Post到ES】 总：${count}, 当前：${i} - ${i + limit}`);
  }
  console.log(`【同步Post到ES】完成`);
};

postSchema.pre('save', async function(next) {
  // elasticSearch: insert/update data
  try{
    postSchema.statics.updateElasticSearch(this);
    return next();
  } catch(err) {
    return next(err);
  }

  /*// handle the ElasticSearch index
  try {
    const {_initial_state_: initialState} = this;
    if (!initialState) {
      // if the initial state is undefined , this is a new post, index it
      await indexPost(this);
      return next()
    } else if (initialState.t !== this.t || initialState.c !== this.c) {
      // this is a old post, and we should check if its title or content has changed,
      // update the doc in elasticsearch when the attribute has changed
      await updatePost(this);
      return next()
    } else
      return next()
  } catch(e) {
    return next(e)

  }*/
});


postSchema.post('save', async function(doc, next) {
  // if p.atUsers has changed, we should generate a invitation

  try {
    const redis = require('../redis');
    const MessageModel = mongoose.model('messages');
    const SettingModel = mongoose.model('settings');

    const {_initial_state_, atUsers} = doc;
    const oldAtUsers = _initial_state_ ? _initial_state_.atUsers : [];
    const notInformedUsers = atUsers
      .filter(at => !oldAtUsers // map the user not in oldAtUsers
        .find(oldAt => oldAt.uid === at.uid));
    await Promise.all(notInformedUsers.map(async at => {
      const messageId = await SettingModel.operateSystemID('messages', 1);
      const message = MessageModel({
        _id: messageId,
        ty: 'STU',
        r: at.uid,
        c: {
          type: 'at',
          targetPid: doc.pid,
          targetUid: doc.uid
        }
      });
      await message.save();
      await redis.pubMessage(message);
    }));
    return next()
  } catch(e) {
    return next(e)
  }
});

const defaultOptions = {
  visitor: {xsf: 0},
  renderHTML: true,
  htmlToText: false,
  count: 200,
  user: true,
  userGrade: true,
  resource: true,
  usersVote: true,
  credit: true,
  showAnonymousUser: false,
  excludeAnonymousPost: false,
  url: false,
  quote: true, // 仅支持同一篇文章
  toDraftReason: false
};
postSchema.statics.extendPost = async (post, options) => {
  const PostModel = mongoose.model("posts");
  const posts = await PostModel.extendPosts([post], options);
  return posts[0];
};
postSchema.statics.extendPosts = async (posts, options) => {
  // 若需要判断用户是否点赞点踩，需要options.user
  const UserModel = mongoose.model('users');
  const UsersGradeModel = mongoose.model('usersGrades');
  const PostsVoteModel = mongoose.model('postsVotes');
  const PostModel = mongoose.model("posts");
  const ResourceModel = mongoose.model('resources');
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const DelPostLogModel = mongoose.model('delPostLog');
  const ThreadModel = mongoose.model('threads');
  const XsfsRecordModel = mongoose.model('xsfsRecords');
  const SettingModel = mongoose.model('settings');
  const creditScore = await SettingModel.getScoreByOperationType('creditScore');
  const o = Object.assign({}, defaultOptions);
  Object.assign(o, options);
  o.usersVote = o.usersVote && !!o.uid;
  const uid = new Set(), usersObj = {}, pid = new Set(), resourcesObj = {}, voteObj = {}, kcbsRecordsObj = {}, xsfsRecordsObj = {};
  let postsId = [], postsObj = {};
  let threadsId = new Set(), threadsAuthor = {};
  let grades, resources;
  posts.map(post => {
    threadsId.add(post.tid);
    pid.add(post.pid);
    if(o.user) {
      uid.add(post.uid);
    }
  });
  const threads = await ThreadModel.find({tid: {$in: [...threadsId]}}, {tid: 1, uid: 1});
  for(const t of threads) {
    threadsAuthor[t.tid] = t.uid;
  }
  if(o.credit) {
    const kcbsRecords = await KcbsRecordModel.find({type: 'creditKcb', pid: {$in: [...pid]}}).sort({toc: 1});
    await KcbsRecordModel.hideSecretInfo(kcbsRecords);
    for(const r of kcbsRecords) {
      uid.add(r.from);
      r.to = "";
      if(!kcbsRecordsObj[r.pid]) kcbsRecordsObj[r.pid] = [];
      kcbsRecordsObj[r.pid].push(r);
    }
    const xsfsRecords = await XsfsRecordModel.find({pid: {$in: [...pid]}, canceled: false}).sort({toc: 1});
    for(const r of xsfsRecords) {
      uid.add(r.operatorId);
      r.uid = "";
      if(!xsfsRecordsObj[r.pid]) xsfsRecordsObj[r.pid] = [];
      xsfsRecordsObj[r.pid].push(r);
    }
  }
  if(o.user) {
    let users = await UserModel.find({uid: {$in: [...uid]}});
    if(o.userGrade) {
      grades = await UsersGradeModel.find().sort({score: -1});
    }
    users.map(user => {
      usersObj[user.uid] = user;
      if(!o.userGrade) return;
      for(const grade of grades) {
        if((user.score < 0?0:user.score) >= grade.score) {
          user.grade = grade;
          break;
        }
      }
    });
  }

  if(o.resource) {
    resources = await ResourceModel.find({references: {$in: [...pid]}});
    await Promise.all(
      resources.map(async resource => await resource.setFileExist())
    )
    resources.map(resource => {
      resource.uid = "";
      resource.references.map(id => {
        if(!resourcesObj[id]) resourcesObj[id] = [];
        resourcesObj[id].push(resource);
      });
    });
  }
  if(o.usersVote) {
    const votes = await PostsVoteModel.find({uid: o.uid, pid: {$in: [...pid]}});
    for(const v of votes) {
      voteObj[v.pid] = v.type;
    }
  }

  if(posts.length) {
    const tid = posts[0].tid;
    const quotePosts = await PostModel.find({tid, parentPostId: ""}, {
      pid: 1, c: 1, uid: 1, anonymous: 1
    }).sort({toc: 1});
    postsId = quotePosts.map(q => {
      postsObj[q.pid] = q;
      return q.pid;
    });
  }

  let draftPostsObj = {};
  if(o.toDraftReason) {
    const draftPosts = await DelPostLogModel.find({
      modifyType: false,
      postType: 'post',
      delType: 'toDraft',
      postId: {$in: [...pid]}
    }, {
      postId: 1, reason: 1
    });
    for(const d of draftPosts) {
      const {postId, reason} = d;
      draftPostsObj[postId] = reason || "";
    }
  }


  const results = [];
  for(let post of posts) {
    if(post.toObject) {
      post = post.toObject();
    }
    if(o.htmlToText) {
      post.c = obtainPureText(post.c, true, o.count);
    }
    post.ownPost = post.uid === o.uid;
    if(post.anonymous && o.excludeAnonymousPost) continue;
    post.credits = [];
    if(o.user) {
      const postUser = usersObj[post.uid];
      if(postUser) {
        // 判断post是否需要折叠
        post.hidePost = await postUser.ensureHidePostPermission(post);
      }
      if(!o.showAnonymousUser && post.anonymous) {
        post.user = "";
        post.uid = "";
        post.uidlm = "";
      } else {
        post.user = postUser;
      }
    }
    if(o.resource) {
      post.resources = resourcesObj[post.pid] || [];
    }
    if(o.usersVote) {
      post.usersVote = voteObj[post.pid];
    }
    if(o.credit) {
      // 学术分、科创币评分记录。
      post.credits = xsfsRecordsObj[post.pid] || [];
      post.credits = post.credits.concat(kcbsRecordsObj[post.pid] || []);
      for(let r of post.credits) {
        if(r.from) {
          r.fromUser = usersObj[r.from];
          r.creditName = creditScore.name;
        } else {
          r.fromUser = usersObj[r.operatorId];
          r.type = 'xsf';
        }
      }
    }
    if(o.url) {
      post.url = await PostModel.getUrl(post.pid);
    }
    // 如果存在引用
    if(o.quote && post.quote) {
      const quotePost = postsObj[post.quote];
      const index = postsId.indexOf(post.quote);
      if(index !== -1 && quotePost) {
        let username, uid;
        if(quotePost.anonymous) {
          username = "匿名用户";
        } else {
          const user = await UserModel.findOne({uid: quotePost.uid}, {username: 1});
          username = user.username;
          uid = quotePost.uid;
        }
        const c = nkcRender.htmlToPlain(quotePost.c, 50);
        post.quotePost = {
          pid: quotePost.pid,
          username,
          uid,
          step: index,
          c
        }
      }
    }
    // 如果需要渲染html
    if(o.renderHTML) {
      post.c = nkcRender.renderHTML({
        type: "article",
        post,
        user: o.visitor
      });
    }
    post.step = postsId.indexOf(post.pid);
    // 退修理由
    if(o.toDraftReason) {
      const reason = draftPostsObj[post.pid];
      if(reason !== undefined) {
        post.draft = {
          reason
        };
      }
    }
    // 是否为文章作者
    post.isAuthor = !post.anonymous? post.uid === threadsAuthor[post.tid]:false;
    results.push(post);
  }
  return results;
};

postSchema.methods.updatePostsVote = async function() {
  const PostModel = mongoose.model('posts');
  const PostsVoteModel = mongoose.model('postsVotes');

  let postsId = [];

  if(this.type === 'thread') {
    const posts = await PostModel.find({tid: this.tid}, {pid: 1});
    postsId = posts.map(post => post.pid);
  } else {
    postsId = [this.pid];
  }

  const votes = await PostsVoteModel.find({pid: {$in: postsId}});

  let upNum = 0, downNum = 0;
  let upNumTotal = 0, downNumTotal = 0;

  for(const vote of votes) {
    if(vote.type === 'up') {
      upNumTotal += vote.num;
      if(vote.pid === this.pid) {
        upNum += vote.num;
      }
    } else {
      downNumTotal += vote.num;
      if(vote.pid === this.pid) {
        downNum += vote.num;
      }
    }
  }
  this.voteUp = upNum;
  this.voteDown = downNum;
  this.voteUpTotal = upNumTotal;
  this.voteDownTotal = downNumTotal;

  await this.updateOne({
    voteUp: upNum,
    voteDown: downNum,
    voteUpTotal: upNumTotal,
    voteDownTotal: downNumTotal
  });

};
/*
  新建post
  @param options
    title: 标题
    content: 内容
    abstractCn: 摘要
    ip: 用户ip地址
    tid: 所属的文章ID
  @return post对象
  @author pengxiguaa 2019/3/7
*/
postSchema.statics.newPost = async (options) => {
  const ForumModel = mongoose.model('forums');
  const SettingModel = mongoose.model('settings');
  const UserModel = mongoose.model('users');
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const IPModel = mongoose.model('ips');
  const {contentLength} = require('../tools/checkString');
  const {title, content, uid, ip, abstractCn, tid, keyWordsCn} = options;
  const thread = await ThreadModel.findOne({tid});
  if(!thread) throwErr(404, `未找到ID为【${tid}】的文章`);
  if(thread.closed) throwErr(403, `文章已被关闭，暂不能发表回复`);
  const user = await UserModel.findById(uid);
  await ForumModel.ensureForumsPermission(thread.mainForumsId, user);
  if(!title) throwErr(400, '标题不能为空');
  if(contentLength(title) > 200) throwErr(400, '标题不能超过200字节');
  if(!content) throwErr(400, '内容不能为空');
  if(contentLength(content) < 6) throwErr(400, '内容太短了，至少6个字节');
  const dbFn = require('../nkcModules/dbFunction');
  const apiFn = require('../nkcModules/apiFunction');
  const quote = await dbFn.getQuote(content);
  let rpid = '';
  if(quote && quote[2]) {
    rpid = quote[2];
  }
  const pid = await SettingModel.operateSystemID('posts', 1);
  const ipToken = await IPModel.saveIPAndGetToken(ip);
  const _post = await new PostModel({
    pid,
    c: content,
    t: title,
    abstractCn,
    keyWordsCn,
    ipoc: ipToken,
    iplm: ipToken,
    l: 'html',
    mainForumsId: thread.mainForumsId,
    minorForumsId: thread.minorForumsId,
    tid,
    uid,
    uidlm: uid,
    rpid
  });
  await _post.save();
  await thread.updateOne({
    lm: pid,
    tlm: Date.now()
  });
  await thread.updateThreadMessage();
  if(quote && quote[2] !== this.oc) {
    const username = quote[1];
    const quPid = quote[2];
    const quUser = await UserModel.findOne({username});
    const quPost = await PostModel.findOne({pid: quPid});
    if(quUser && quPost) {
      const messageId = await SettingModel.operateSystemID('messages', 1);
      const message = MessageModel({
        _id: messageId,
        r: quUser.uid,
        ty: 'STU',
        c: {
          type: 'replyPost',
          targetPid: pid+'',
          pid: quPid+''
        }
      });

      await message.save();

      await redis.pubMessage(message);
    }
  }
  // 红包奖励判断
  await user.setRedEnvelope();

  return _post
};

/*
* 获取回复或评论的url
* @param {String} pid 评论、回复的ID或对象
* @return {String} 不带域名的url
* @author pengxiguaa 2019-6-11
* */
postSchema.statics.getUrl = async function(pid, redirect) {
  // 2020-3-20 pengxiguaa
  // 由于新能问题，此方法不再返回带楼层的链接地址
  // 返回post详细页并附带跳转参数，post详情页路由再做处理。

  if(!redirect) {
    if(typeof(pid) !== "string") {
      pid = pid.pid;
    }
    return `/p/${pid}?redirect=true`;
  }


  const PostModel = mongoose.model('posts');
  const SettingModel = mongoose.model("settings");
  // const pageSettings = await SettingModel.findOnly({_id: "page"});
  const pageSettings = await SettingModel.getSettings('page');
  let post;
  if(typeof(pid) == "string") {
    post = await PostModel.findOnly({pid});
  } else {
    post = pid;
  }

  const isComment = post.parentPostsId.length !== 0;
  let posts, perpage;
  if(!isComment) {
    perpage = pageSettings.threadPostList;
    posts = await PostModel.find({type: "post", tid: post.tid, parentPostId: ""}, {pid: 1, _id: 0}).sort({toc: 1});
    const postsId = posts.map(post => post.pid);
    const step = postsId.indexOf(post.pid);
    if(step === -1) return `/t/${post.tid}`;
    const page = Math.floor(step/perpage);
    return `/t/${post.tid}?page=${page}&highlight=${post.pid}#highlight`;
  } else {
    perpage = pageSettings.threadPostCommentList;
    const postId = post.parentPostsId[0];
    // 获取post下最顶层的所有回复
    posts = await PostModel.find({type: "post", parentPostId: postId}, {pid: 1}).sort({toc: 1});
    const postsId = posts.map(p => p.pid);
    let step;
    if(post.parentPostsId.length >= 2) {
      // 当前评论位于第二层或更底层，则分页按最顶层post分
      step = postsId.indexOf(post.parentPostsId[1]);
    } else {
      // 如果当前评论位于最顶层，则分页按当前评论分
      step = postsId.indexOf(post.pid);
    }
    const page = Math.floor(step/perpage);
    return `/p/${postId}?page=${page}&highlight=${post.pid}`;
  }
};

/*
* 验证作者是否有权限置顶回复
* @param {String} uid 用户ID
* @return {Boolean} 是否有权限
* @author pengxiguaa 2019-9-26
* */
postSchema.statics.ensureToppingPermission = async function(uid) {
  const user = await mongoose.model("users").findOne({uid});
  if(!user) return false;
  const topSettings = await mongoose.model("settings").getSettings("topping");
  const {rolesId, defaultRoleGradesId} = topSettings;
  await user.extendRoles();
  for(const r of user.roles) {
    if(rolesId.includes(r._id) && r._id !== "default") return true;
  }
  if(rolesId.includes("default")) {
    await user.extendGrade();
    return defaultRoleGradesId.includes(user.grade._id);
  } else {
    return false;
  }
};
/*
* 验证用户是否具有查看文章附件列表的权限
* @param {String} uid 用户ID
* @return {Boolean} 是否有权限
* @author pengxiguaa 2019-9-26
* */
postSchema.statics.ensureAttachmentPermission = async function(uid) {
  const threadSettings = await mongoose.model("settings").getSettings("thread");
  const {rolesId, gradesId} = threadSettings.displayPostAttachments;
  if(!uid) return rolesId.includes("visitor");
  const user = await mongoose.model("users").findOne({uid});
  if(!user) return rolesId.includes("visitor");
  await user.extendRoles();
  for(const r of user.roles) {
    if(rolesId.includes(r._id) && r._id !== "default") return true;
  }
  await user.extendGrade();
  return gradesId.includes(user.grade._id);
};


/**
* 获取最新回复
* @param {[String]} fid, 可以访问的专业ID所组成的数组
* @param {Number} limit, 条数
* @return {[Object]} post数组
* @author pengxiguaa 2019-12-05
*/
postSchema.statics.getLatestPosts = async (fid, limit = 9) => {
  const {obtainPureText} = require("../nkcModules/apiFunction");
  const PostModel = mongoose.model("posts");
  const UserModel = mongoose.model("users");
  const ThreadModel = mongoose.model("threads");
  const posts = await PostModel.find({
    type: "post",
    mainForumsId: {$in: fid},
    reviewed: true,
    disabled: false,
    toDraft: {$ne: true}
  }, {
    t: 1,
    c: 1,
    uid: 1,
    pid: 1,
    toc: 1,
    anonymous: 1,
    parentPostId: 1,
    tid: 1
  }).sort({toc: -1}).limit(limit);
  const usersId = [], threadsId = [], parentPostsId = [];
  posts.map(post => {
    usersId.push(post.uid);
    threadsId.push(post.tid);
    if(post.parentPostId) parentPostsId.push(post.parentPostId);
  });
  const users = await UserModel.find({uid: {$in: usersId}}, {avatar: 1, uid: 1, username: 1});
  let threads = await ThreadModel.find({tid: {$in: threadsId}});
  threads = await ThreadModel.extendThreads(threads, {
    firstPost: 1,
    firstPostUser: 1
  });
  const parentPosts = await PostModel.find({pid: {$in: parentPostsId}});
  const usersObj = {}, threadsObj = {}, parentPostsObj = {};
  users.map(user => usersObj[user.uid] = user);
  threads.map(thread => threadsObj[thread.tid] = thread);
  parentPosts.map(post => parentPostsObj[post.pid] = post);
  const results = [];
  for(const post of posts) {
    const user = usersObj[post.uid];
    const thread = threadsObj[post.tid];
    if(!user || !thread) return;
    post.c = obtainPureText(post.c, true, 200);
    if(!post.anonymous) post.user = user;
    post.thread = thread;
    post.url = await PostModel.getUrl(post.pid);
    const r = {
      toc: post.toc,
      url: post.url,
      c: post.c,
      user: post.user,
      targetUser: thread.firstPost.user,
      type: "reply"
    };
    if(post.parentPostId) {
      const parentPost = parentPostsObj[post.parentPostId];
      if(!parentPost.anonymous) {
        await parentPost.extendUser();
      }
      r.targetUser = parentPost.user;
      r.type = "comment";
    }
    results.push(r);
  }
  return results;
};

postSchema.statics.ensureHidePostPermission = async (thread, user) => {
  if(!user) return false;
  const hidePostSettings = await mongoose.model("settings").getSettings("hidePost");
  const {allowedAuthor, allowedRolesId} = hidePostSettings;
  if(allowedAuthor && thread.uid === user.uid) return true;
  if(!user.roles) {
    await user.extendRoles();
  }
  for(const role of user.roles) {
    if(allowedRolesId.includes(role._id)) return true;
  }
  return false;
};

/*
* 获取待推送的回复
* */
postSchema.statics.getSocketCommentByPid = async (post) => {
  const UserModel = mongoose.model('users');
  const tools = require('../nkcModules/tools');
  const nkcRender = require('../nkcModules/nkcRender');
  let avatarUrl, username, content, contentUrl, uid;
  if(post.anonymous) {
    const anonymousInfo = tools.getAnonymousInfo();
    avatarUrl = anonymousInfo.avatarUrl;
    username = anonymousInfo.username;
    uid = null;
  } else {
    const user = await UserModel.findOnly({uid: post.uid});
    avatarUrl = tools.getUrl("userAvatar", user.avatar);
    username = user.username;
    uid = user.uid;
  }
  content = nkcRender.htmlToPlain(post.c, 50)
  contentUrl = tools.getUrl('post', post.pid);
  return {
    postId: post.pid,
    avatarUrl,
    uid,
    username,
    content,
    contentUrl
  };
};

/*
* 文章页回复列表 过滤掉postSchema.statics.extendPosts拓展之后的无用字段
* @param {[post, post, ...]} 经postSchema.statics.extendPosts拓展之后的数据
* @return {[object, object, ...]} 详见/pages/thread/singlePost/singlePost.pug
* @author pengxiguaa 2020-12-16
* */
postSchema.statics.filterPostsInfo = async (posts) => {
  const tools = require('../nkcModules/tools');
  const anonymousUser = tools.getAnonymousInfo();
  const results = [];
  for(const post of posts) {
    let user;
    if(post.anonymous) {
      user = {
        uid: null,
        username: anonymousUser.username,
        avatar: anonymousUser.avatarUrl,
        gradeId: null,
        gradeName: null,
        banned: false,
      }
    } else {
      user = {
        uid: post.user.uid,
        username: post.user.username,
        avatar: tools.getUrl('userAvatar', post.user.avatar),
        gradeId: post.user.grade._id,
        gradeName: post.user.grade.displayName,
        banned: post.user.certs.includes('banned'),
      }
    }

    let quote = null;
    if(post.quotePost) {
      quote = {
        uid: post.quotePost.uid || null,
        username: post.quotePost.uid? post.quotePost.username: anonymousUser.username,
        floor: post.quotePost.step,
        content: post.quotePost.c,
        pid: post.quotePost.pid,
      };
    }

    const kcb = [], xsf = [];
    if(post.credits && post.credits.length) {
      for(const credit of post.credits) {
        const {_id, hideDescription: hide, creditName, num, type, fromUser, description, toc} = credit;
        const c = {
          _id,
          uid: fromUser.uid,
          username: fromUser.username,
          avatar: tools.getUrl('userAvatar', fromUser.avatar),
          description,
          toc,
          number: num
        }
        if(type === 'creditKcb') {
          c.number = c.number / 100;
          c.type = 'kcb';
          c.name = creditName;
          c.hide = hide;
          kcb.push(c);
        } else {
          c.type = 'xsf';
          c.name = '学术分';
          xsf.push(c);
        }
      }
    }
    const result = {
      pid: post.pid,
      tid: post.tid,
      floor: post.step,
      cv: post.cv, // post内容版本
      toc: post.toc,
      tlm: new Date(post.toc).getTime() === new Date(post.tlm).getTime()? null: post.tlm,
      count: post.postCount,
      title: post.t,
      content: post.c,
      vote: post.usersVote || null,
      reviewed: post.reviewed,
      draft: post.draft? {reason: post.draft.reason}: null,
      disabled: post.disabled,
      isAuthor: post.isAuthor,
      type: post.type,
      voteUp: post.voteUp,
      digest: post.digest,
      hide: post.hidePost || post.hide,
      cRead: ['r', 'rw'].includes(post.comment),
      user,
      quote,
      kcb,
      xsf
    };
    results.push(result);
  }
  // console.log(results);
  return results;
};

/*
* 文章页的评论列表
* */
postSchema.statics.filterCommentsInfo = async (posts) => {
  const tools = require('../nkcModules/tools');
  const anonymousUser = tools.getAnonymousInfo();
  const results = [];
  for(const post of posts) {
    let user;
    if(post.anonymous) {
      user = {
        uid: null,
        username: anonymousUser.username,
        avatar: anonymousUser.avatarUrl,
        banned: false,
      }
    } else {
      user = {
        uid: post.user.uid,
        username: post.user.username,
        avatar: tools.getUrl('userAvatar', post.user.avatar),
        banned: post.user.certs.includes('banned'),
      }
    }

    const kcb = [], xsf = [];
    if(post.credits && post.credits.length) {
      for(const credit of post.credits) {
        const {_id, hideDescription: hide, creditName, num, type, fromUser, description, toc} = credit;
        const c = {
          _id,
          uid: fromUser.uid,
          username: fromUser.username,
          avatar: tools.getUrl('userAvatar', fromUser.avatar),
          description,
          toc,
          number: num
        }
        if(type === 'creditKcb') {
          c.number = c.number / 100;
          c.type = 'kcb';
          c.name = creditName;
          c.hide = hide;
          kcb.push(c);
        } else {
          c.type = 'xsf';
          c.name = '学术分';
          xsf.push(c);
        }
      }
    }
    const result = {
      parentId: post.parentPostId,
      parentsId: post.parentPostsId,
      parentUser: null,
      childPosts: [],
      pid: post.pid,
      tid: post.tid,
      cv: post.cv, // post内容版本
      toc: post.toc,
      tlm: new Date(post.toc).getTime() === new Date(post.tlm).getTime()? null: post.tlm,
      content: post.c,
      vote: post.usersVote || null,
      reviewed: post.reviewed,
      draft: post.draft? {reason: post.draft.reason}: null,
      disabled: post.disabled,
      isAuthor: post.isAuthor,
      type: post.type,
      voteUp: post.voteUp,
      digest: post.digest,
      user,
      kcb,
      xsf
    };
    results.push(result);
  }
  let postsObj = {};
  for(const post of results) {
    postsObj[post.pid] = post;
  }

  const comments = [];

  for(const post of results) {
    const {parentId, parentsId} = post;
    let parentPost;
    if(parentsId.length >= 4) {
      // 限制层数 3
      parentPost = postsObj[parentsId[3]];
    } else {
      parentPost = postsObj[parentId];
    }
    if(!parentPost) {
      comments.push(post);
      continue;
    }
    post.parentUser = Object.assign({}, parentPost.user);
    parentPost.childPosts.push(post);
  }
  return comments;
}

/*
* 判断当前用户是否为post所在专业的专家
* @param {String} uid 用户ID
* @param {String} pid post ID
* @return {Boolean} 是否为专家
* @author pengxiguaa 2020-12-21
* */
postSchema.statics.isModerator = async (uid, pid) => {
  const PostModel = mongoose.model('posts');
  const ForumModel = mongoose.model('forums');
  const post = await PostModel.findOne({pid}, {mainForumsId: 1});
  if(!post) return false;
  return await ForumModel.isModerator(uid, post.mainForumsId);
};

/*
* 渲染post用于socket推送
* @param {String} pid postID
* @return {String} html
* @author pengxiguaa 2021-1-11
* */
postSchema.statics.renderSinglePostToHTML = async (pid) => {
  const render = require('../nkcModules/render');
  const PostModel = mongoose.model('posts');
  const post = await PostModel.findOnly({
    pid,
  });
  let postData = await PostModel.extendPost(post);
  const parentCommentId = post.parentPostId;
  let html;
  if(!parentCommentId) {
    postData = (await PostModel.filterPostsInfo([postData]))[0];
    html = render(PATH.resolve(__dirname, `../pages/thread/singlePost/singlePostPage.pug`), {postData});
  } else {
    postData = (await PostModel.filterCommentsInfo([postData]))[0];
    html = render(PATH.resolve(__dirname, `../pages/thread/singleComment/singleCommentPage.pug`), {postData});
  }
  return html;
}

/*
* 获取推送post的事件名称
* */
postSchema.statics.getSocketEventName = async (pid) => {
  const PostModel = mongoose.model('posts');
  const post = await PostModel.findOnly({pid}, {parentPostId: 1});
  return post.parentPostId? 'commentMessage': 'postMessage';
}

/*
* 获取单条post动态渲染推送的数据
* */
postSchema.statics.getSocketSinglePostData = async (pid) => {
  const PostModel = mongoose.model('posts');
  const post = await PostModel.findOnly({
    pid,
  });
  const parentCommentId = post.parentPostId;
  const parentPostId = post.parentPostsId[0];
  const comment = await PostModel.getSocketCommentByPid(post);
  const html = await PostModel.renderSinglePostToHTML(post.pid);
  return {
    parentCommentId,
    parentPostId,
    comment,
    html,
    post
  };
}


/*
* 关注页拓展posts
* @param {[Object]} posts 文章对象数组
* @return {Object}
*   @param {Object} user
*     @param {String} uid 用户ID 匿名时为null
*     @param {String} username 用户名
*     @param {String} avatar 头像链接
*     @param {Boolean} banned 是否被封禁
*   @param {String} pid
*   @param {String} tid
*   @param {String} type 内容类型 "thread" or "post"
*   @param {Date} toc 发表时间
*   @param {String} title 标题
*   @param {String} content 摘要
*   @param {String} 封面图片链接
*   @param {String} forumsId 主专业ID
*   @param {Object} quote 当内容为文章时此字段为null，为回复时此字段表示回复所在的文章信息
*     @param {Object} user 同上
*     @param {Date} toc 同上
*     @param {String} title 同上
*     @param {String} content 同上
*     @param {String} cover 同上
* @author pengxiguaa 2021-2-4
* */
postSchema.statics.extendActivityPosts = async (posts) => {
  const UserModel = mongoose.model('users');
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const tools = require('../nkcModules/tools');
  const nkcRender = require('../nkcModules/nkcRender');
  let anonymousUser = tools.getAnonymousInfo();
  anonymousUser = {
    uid: null,
    username: anonymousUser.username,
    avatar: anonymousUser.avatarUrl,
    banned: false,
  };
  const usersId = new Set();
  const threadsId = new Set();
  const firstPostsId = new Set();
  const threadFirstPosts = {};
  const usersObj = {};
  for(const post of posts) {
    const {type, uid, tid, anonymous} = post;
    if(type === 'post') threadsId.add(tid);
    if(!anonymous) usersId.add(uid);
  }
  const threads = await ThreadModel.find({tid: {$in: [...threadsId]}}, {oc: 1});
  for(const thread of threads) {
    firstPostsId.add(thread.oc);
  }
  const firstPosts = await PostModel.find({pid: {$in: [...firstPostsId]}}, {
    tid: 1,
    uid: 1,
    pid: 1,
    t: 1,
    c: 1,
    anonymous: 1,
    toc: 1,
    cover: 1
  });
  for(const fp of firstPosts) {
    usersId.add(fp.uid);
    threadFirstPosts[fp.tid] = fp;
  }
  const users = await UserModel.find({uid: {$in: [...usersId]}});
  for(const user of users) {
    const {uid, avatar, username, certs} = user;
    usersObj[user.uid] = {
      uid,
      avatar: tools.getUrl('userAvatar', avatar),
      username,
      banned: certs.includes("banned")
    };
  }
  const results = [];
  for(const post of posts) {
    const {
      type,
      pid,
      toc,
      tid,
      uid,
      c,
      t,
      anonymous,
      cover,
      mainForumsId,
    } = post;
    let user;
    if(anonymous) {
      user = anonymousUser;
    } else {
      user = usersObj[uid];
    }
    let quote = null;
    let url = null;
    if(type === 'post') {
      const firstPost = threadFirstPosts[tid];
      let quoteUser = null;
      if(firstPost.anonymous) {
        quoteUser = anonymousUser;
      } else {
        quoteUser = usersObj[firstPost.uid];
      }
      quote = {
        user: quoteUser,
        toc: firstPost.toc,
        title: firstPost.t,
        url: tools.getUrl('thread', firstPost.tid),
        content: nkcRender.htmlToPlain(firstPost.c, 200),
        cover: firstPost.cover? tools.getUrl('postCover', firstPost.cover):null
      }
      url = tools.getUrl('post', pid);
    } else {
      url = tools.getUrl('thread', tid);
    }
    results.push({
      pid,
      tid,
      user,
      type,
      toc,
      url,
      title: t,
      content: nkcRender.htmlToPlain(c, 200),
      cover: cover? tools.getUrl('postCover', cover):null,
      forumsId: mainForumsId,
      quote
    });
  }
  return results;
};

/*
* 判断是否可以在当前post下发表评论
* @param {String} pid
* @param {String} type 权限类型 read: 查看评论, write: 发表评论
* @return {Boolean}
* @author pengxiguaa 2021-3-1
* */
postSchema.statics.checkPostCommentPermission = async (pid, type) => {
  const PostModel = mongoose.model('posts');
  let post = await PostModel.findOnly({pid}, {parentPostId: 1, parentPostsId: 1, pid, comment: 1});
  if(post.type === 'thread') return false;
  if(post.parentPostsId.length > 0) {
    post = await PostModel.findOnly({pid: post.parentPostsId[0]}, {comment: 1});
  }
  if(!['read', 'write'].includes(type)) throwErr(500, `评论控制类型错误 type: ${type}`);
  if(type === 'read') {
    return ['r', 'rw'].includes(post.comment);
  } else {
    return ['rw'].includes(post.comment);
  }
};

module.exports = mongoose.model('posts', postSchema);
