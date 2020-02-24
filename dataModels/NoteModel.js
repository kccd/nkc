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
  notes: {
    /* [
      {
        // 批注时间
        toc: {
          type: Date,
          default: Date.now,
          index: 1
        },
        // 批注的用户
        uid: {
          type: String,
          default: Date.now,
          index: 1
        },
        // 批注的内容
        c: {
          type: String,
          required: true
        }    
      }
    ] */
    type: Schema.Types.Mixed,
    required: true
  },
  toc: {
    type: Date,
    defalt: Date.now,
    index: 1
  },
  nodes: {
    /* [
      {
        // 元素名
        tagName: {
          type: String,
          required: true
        },
        // 元素索引
        index: {
          type: Number,
          required: true
        },
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
        c: {
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

schema.statics.getNotes = async (type, targetId) => {
  const notes = await mongoose.model("notes").find({type, targetId}).sort({toc: -1});
  return notes.map(note => note.toObject());
};

module.exports = mongoose.model('notes', schema);