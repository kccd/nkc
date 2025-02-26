const { settingIds } = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.exam,
  c: {
    waitingTime: 15, // 超过次数之后的等待时间（天）
    count: 50, // 超过一定数量后需等待一定时间（waitingTime）之后才能参加考试
    countOneDay: 10, // 每天参加考试次数最大值
    examNotes:
      '科创是面向科技爱好者的网站，非大众网站。\n' +
      'Kechuang is a website for Enthusiasts, not a general website.\n' +
      '科技爱好者是专业的、狂热的、实操的，并且具有持久性。\n' +
      'Enthusiasts are professional, enthusiastic, practical, and persistent.\n' +
      '科创欢迎新人且足够友好。同时为了持续改善学习氛围，有必要设置招生门槛。\n' +
      'Kechuang welcomes new members and is very friendly to new members. At the same time, in order to continuously improve the academic atmosphere, registration requires you to first understand the culture and rules of kechuang.\n' +
      '已将资源下载等服务向游客开放。除非打算深度参与，没有必要注册。\n' +
      'Services such as resource downloading have been opened to tourists. There is no need to register unless you plan to participate deeply.\n' +
      '请通过答题来了解一些科创的知识。题目经过挑选，有利于迅速融入。\n' +
      'Please answer the questions to learn some knowledge about kechuang. The topics have been selected and representative.', //闭卷考试须知
    volumeANotes:
      'A卷考试是闭卷考试。\n' +
      '通过A卷考试是进入论坛（预印本）发表文章的前提条件之一。\n' +
      '通过A卷考试的用户将来可以再参加B卷考试。',
    volumeBNotes:
      'B卷考试是闭卷考试。\n' +
      '通过B卷考试是参与特种科技爱好话题交流的条件之一。\n',
    volumeADNotes:
      '入学培训属于学习型考试，不评判分数，通过提示可以全部答对。\n' +
      '如果回答正确，选中的选项会显示绿色。\n' +
      '如果回答错误，选项不变色，但会展示对选项的讲解。\n' +
      '如果回答错误，请仔细阅读每个选项的讲解，理解其意义，然后点击“重做”按钮。\n' +
      '当所有的题目都答对以后，培训结业。\n' +
      'The purpose of first test is to help you understand the culture here.  You can answer all questions correctly through prompts.\n' +
      'If answered correctly, the selected option will appear green.\n' +
      'If the answer is incorrect, the option will not change color, but an explanation of the option will be displayed.\n' +
      'If you answer incorrectly, please read the explanation of each option carefully to understand its meaning, and then click the "Redo" button.\n' +
      'When all questions are answered correctly, the exam is passed.',
  },
};
