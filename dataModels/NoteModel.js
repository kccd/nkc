const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  type: {
    type: String,
    required: true,
    index: 1
  },
  targetId: {
    type: String,
    required: true,
    index: 1
  },
  // 原文对应的版本号
  cv: {
    type: Number,
    default: null
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 划选文字
  content: {
    type: String,
    default: ""
  },
  node: {
    // 文本节点的开始位置
    offset: {
      type: Number,
      required: true,
      index: 1
    },
    // 文本节点的结束位置
    // 为0时，表示游离选区
    length: {
      type: Number,
      required: true,
      index: 1
    }
  }
}, {
  collection: 'notes'
});
schema.statics.getNotesByPost = async (post) => {
  const NoteModel = mongoose.model("notes");
  return (await NoteModel.getNotesByPosts([post]))[0];
};
schema.statics.getNotesByPosts = async (posts) => {
  const NoteModel = mongoose.model("notes");
  const match = {
    type: "post",
    $or: []
  };
  posts.map(post => {
    const obj = {
      targetId: post.pid
    };
    if(post.cv !== undefined) {
      obj.cv = post.cv
    }
    match.$or.push(obj);
  });
  let notes = await NoteModel.find(match).sort({toc: 1});
  // notes = await NoteModel.extendNotes(notes);
  const map = new Map();
  for(const p of posts) {
    if(!map.has(p.pid)) {
      map.set(p.pid, {
        type: "post",
        targetId: p.pid,
        notes: []
      })
    }
  }
  for(const note of notes) {
    const value = map.get(note.targetId);
    value.notes.push(note);
  }
  return [...map.values()];
};
schema.statics.extendNote = async (note, options) => {
  const notes = await mongoose.model("notes").extendNotes([note], options);
  return notes[0];
};
schema.statics.extendNotes = async (notes_, options = {}) => {
  const {disabled, deleted} = options;
  const NoteContentModel = mongoose.model("noteContent");
  const notes = [], notesId = [];
  notes_.map(n => {
    if(n.toObject) n = n.toObject();
    notes.push(n);
    notesId.push(n._id);
  });
  const match = {
    // noteId: {$in: notesId},

    notesId: {$in: notesId},
    cid: null
  };
  if(disabled !== undefined) {
    match.disabled = disabled;
  }
  if(deleted !== undefined) {
    match.deleted = deleted;
  }
  let noteContent = await NoteContentModel.find(match).sort({toc: 1});
  noteContent = await NoteContentModel.extendNoteContent(noteContent);
  const noteContentObj = {};
  noteContent.map(n => {
    n.notesId.map(noteId => {
      if(!noteContentObj[noteId]) noteContentObj[noteId] = [];
      noteContentObj[noteId].push(n);
    });
  });
  return notes.map(note => {
    note.notes = noteContentObj[note._id] || [];
    return note;
  });
};

module.exports = mongoose.model('notes', schema);