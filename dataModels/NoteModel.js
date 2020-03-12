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
  nodes: {
    /* [
      {
        // 文本节点的开始位置
        offset: {
          type: Number,
          required: true
        },
        // 文本节点的结束位置
        length: {
          type: Number,
          required: true
        },
        // 节点的文本
        content: {
          type: String,
          default: ""
        }
      }
    ] */
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  collection: 'notes'
});

schema.statics.getNotesByPostId = async (pid, cv) => {
  const NoteModel = mongoose.model("notes");
  const match = {
    type: "post",
    targetId: pid,
  };
  if(cv !== undefined) {
    match.cv = cv;
  }
  const notes = await NoteModel.find(match);
  return await NoteModel.extendNotes(notes);
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
    noteId: {$in: notesId},
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
    if(!noteContentObj[n.noteId]) noteContentObj[n.noteId] = [];
    noteContentObj[n.noteId].push(n);
  });
  return notes.map(note => {
    note.notes = noteContentObj[note._id] || [];
    return note;
  });
};

module.exports = mongoose.model('notes', schema);