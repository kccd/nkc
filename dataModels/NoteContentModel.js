const mongoose = require('mongoose');
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
    default: ''
  },
  // cid不为null, 则词记录是历史
  cid: {
    type: Number,
    default: null,
    index: 1
  },
  // 选区ID
  notesId: {
    type: [Number],
    default: [],
    index: 1
  },
  // 旧 选区ID
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
  }
}, {
  collection: "noteContent"
});

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
    const notes = await mongoose.model("notes").find({_id: {$in: notesId}});
    notes.map(note => {
      notesObj[note._id] = note
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
schema.methods.cloneAndUpdateContent = async function(content) {
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
  const newNodeContent = NoteContentModel(nc);
  await newNodeContent.save();
  await this.update({
    content,
    tlm
  });
};

module.exports = mongoose.model("noteContent", schema);