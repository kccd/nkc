const dict = require("./dictionary");

/**
 * 检查字符串中是否包含弱密码字符串
 * @param {string} password 密码
 * @returns {String[]} result.includes 字符串数组，包含哪些弱密码字符串(从字典中查到的)
 */
function checker(password) {
  const includes = [];
  dict.forEach(wp => {
    if(password.includes(wp)) 
      includes.push(wp);
  });
  return {
    pass: !includes.length,
    includes
  };
}

module.exports = checker;