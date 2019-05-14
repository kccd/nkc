/*
  抛出错误，指定前端错误页面模板
  @param {Number} status 状态码
  @param {String} errorData 错误信息
  @param {String} errorType 错误类型
  @author pengxiguaa 2019-5-14
*/
module.exports = (status, errorData, errorType) => {
  let message;
  if(errorType) {
    message = JSON.stringify({
      errorData,
      errorType
    });
  } else {
    message = errorData;
  }
  const error = new Error(message);
  error.status = status || 500;
  throw error;
};