module.exports = {
  // A卷考试
  numberOfSubjectA: 10,
  numberOfCommonA: 0,
  // B卷考试
  numberOfSubject:8,
  numberOfCommon:2,
  //考试时间为 45分钟
  timeLimit:(60*1000*45),
  //10道题至少答对6道题才算及格
  passScore: 6,
  //重复获取激活码时间限制 12小时
  succeedInterval:3600*1000*12
};