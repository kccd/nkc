const { settingIds } = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.exam,
  c: {
    waitingTime: 15, // 超过次数之后的等待时间（天）
    count: 50, // 超过一定数量后需等待一定时间（waitingTime）之后才能参加考试
    countOneDay: 10, // 每天参加考试次数最大值
    examNotes: '', //闭卷考试须知
    publicExamNotes: '', //开卷考试须知
  },
};
