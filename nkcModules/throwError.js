const {ThrowErrorPageError, ThrowCommonError} = require('./error');
/*
  抛出错误，指定前端错误页面模板
  @param {Number} status 状态码
  @param {String} errorData 错误信息
  @param {String} errorType 错误类型
  @author pengxiguaa 2019-5-14
*/
module.exports = (status, errorData, errorType) => {
  if(!errorType) {
    ThrowCommonError(status, errorData);
  } else {
    ThrowErrorPageError(status, errorType, errorData);
  }
};
