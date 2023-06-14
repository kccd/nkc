const mongoose = require('mongoose');
const { getUrl, fromNow } = require('../nkcModules/tools');
const videoSize = require('../settings/video');
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    nid: {
      type: String,
      unique: true,
      required: true,
    },
    pid: {
      type: String,
      required: true,
      index: 1,
    },
    hid: {
      type: String,
      index: 1,
      required: true,
    },
    noticeContent: {
      type: String,
      required: true,
    },
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
  },
  { collection: 'newNotices' },
);

schema.statics.extendNoticeContent = async ({ pid, hid, noticeContent }) => {
  const NewNoticesModel = mongoose.model('newNotices');
  const SettingModel = mongoose.model('settings');
  const nid = await SettingModel.operateSystemID('newNotices', 1);
  const noticeObj = {
    nid,
    pid,
    hid,
    noticeContent,
  };
  const newNotice = new NewNoticesModel(noticeObj);
  return await newNotice.save();
};

schema.statics.updateThreadStatus = async (tid, isNewThread = false) => {
  const ThreadModel = mongoose.model('threads');
  await ThreadModel.updateOne(
    { tid },
    {
      $set: {
        isNewThread,
      },
    },
  );
};

module.exports = mongoose.model('newNotices', schema);
