var inBrowser = (typeof document !== 'undefined');
var CheckData = function () {
  if(inBrowser) {
    this.te = function(status, info) {
      throw info;
    };
  } else {
    this.te = global.throwErr;
  }
  var self = this;
  /*
  * 获取数据长度
  * @param {Number/String} data 待检测的数据
  * @return {Number}
  * @author pengxiguaa 2019-9-6
  * */
  self.getLength = function(data) {
    data = data.toString();
    var zhCN = data.match(/[^\x00-\xff]/g) || [];
    return data.length + zhCN.length;
  };
  /*
  * 检测数字类型
  * @param data 需要检测的数据
  * @param {Object} options
  *   name: 变量名
  *   min: 最小值
  *   max: 最大值
  *   fractionDigits: 小数位数
  * @author pengxiguaa 2019-9-6
  * */
  this.checkNumber = function(data, options) {
    options = options || {};
    var min = options.min;
    var max = options.max;
    var fractionDigits = options.fractionDigits || 0;
    var name = options.name || "";
    if(typeof(data) !== "number" || isNaN(data)) {
      self.te(400, name + "数据类型错误");
    }
    if(min !== undefined) {
      if(data < min) self.te(400, name + "数值不能小于" + min);
    }
    if(max !== undefined) {
      if(data > max) self.te(400, name + "数值不能大于" + max);
    }
    var dataArr = data.toString().split(".")[1];
    var length = (dataArr || "").length;
    if(length > fractionDigits) {
      if(fractionDigits === 0) self.te(400, name + "数值必须为整数");
      self.te(400, name + "小数点位数不符合规定");
    }
  };
  /*
  * 检测字符串
  * @param data 需要检测的数据
  * @param {Object} options
  *   name: 变量名
  *   minLength: 最小字节长度
  *   maxLength: 最大字节长度
  *   minTextLength: 最小字数 通过 $(content).text().length 获得的字数，可用于判断 html
  *   maxTextLength: 最大字数 通过 $(content).text().length 获得的字数，可用于判断 html
  * @author pengxiguaa 2019-9-6
  * */
  this.checkString = function(data, options) {
    options = options || {};
    var name = options.name || "";
    var minLength = options.minLength;
    var maxLength = options.maxLength;
    var minTextLength = options.minTextLength;
    var maxTextLength = options.maxTextLength;

    if(typeof(data) !== "string") {
      self.te(400, name + "数据类型错误");
    }
    if(minLength !== undefined && self.getLength(data) < minLength) {
      self.te(400, name + "长度不能小于" + minLength + "个字节");
    }
    if(maxLength !== undefined && self.getLength(data) > maxLength) {
      self.te(400, name + "长度不能大于" + maxLength + "个字节");
    }
    if(minTextLength !== undefined && self.getHTMLTextLength(data) < minTextLength) {
      self.te(400, name + "字数不能小于" + minTextLength + "个字");
    }
    if(maxTextLength !== undefined && self.getHTMLTextLength(data) > maxTextLength) {
      self.te(400, name + '字数不能大于' + maxTextLength + '个字');
    }
  };

  /**
   * 检测标签内容长度
   * @param html 标签正确闭合的html文本
   * @private {Object} options
   *    name: 变量名
   *    minLength: 最小字节长度
   *    maxLength: 最大字节长度
   * @author yuu 2020-3-27
   */
  /*self.checkTagContent = function(html, {minLength = 1, maxLength = 5000, name = ""}) {
    const cheerio = require('cheerio')
    let $ = cheerio.load("");
    let content = $(html).text();
    // console.log(content);
    if(typeof(html) !== "string") {
      self.te(400, name + "数据类型错误");
      // console.log(name + "数据类型错误");

    }
    if(content.length < minLength) {
      self.te(400, name + "长度不能小于" + minLength + "个字节");
      // console.log(name + "长度不能小于" + minLength + "个字节");

    }
    if(content.length > maxLength) {
      self.te(400, name + "长度不能大于" + maxLength + "个字节");
      // console.log(name + "长度不能大于" + maxLength + "个字节");
    }
  };*/

  this.getHTMLTextLength = function(html) {
    if(inBrowser) {
      return $(html).text().length;
    } else {
      const cheerio = require('cheerio');
      return cheerio.load(html).text().length;
    }
  };

  /*
  * 检测邮箱格式
  * */
  this.checkEmail = function(data) {
    var path = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    if(!path.test(data)) {
      self.te(400, "邮箱格式不符合要求");
    }
  };

};
if(inBrowser) {
  NKC.methods.checkData = new CheckData();
} else {
  module.exports = new CheckData();
}
