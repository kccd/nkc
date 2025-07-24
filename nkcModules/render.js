const render = require('./nkc_render');
const nkcRender = require('./nkcRender');
const moment = require('moment');
const pug = require('pug');
const settings = require('../settings');
const { isProduction, NODE_ENV } = require('../settings/env');
moment.locale('zh-cn');
// const languages = require('../languages');
const languages = require('./language');
const tools = require('./tools');
const htmlFilter = require('./nkcRender/htmlFilter');
const hexToRgba = require('hex-to-rgba');
const { startTime } = require('../settings/time');
const { contentDiff } = require('./diff');
const filters = {
  markdown: render.commonmark_render,
  markdown_safe: render.commonmark_safe,
  bbcode: render.bbcode_render,
  thru: function (k) {
    return k;
  },
};

const replaceContent = (c) => {
  let temp = c;
  temp = temp.replace(/<[a-zA-Z]+.*?>/gi, ' ');
  temp = temp.replace(/<\/[a-zA-Z]+>/gi, ' ');
  temp = temp.replace(
    /\[hide=[0-9]+][^[]*\[\/hide]/gi,
    '<span style="background-color: red">学术分限制内容</span>',
  );
  // temp = temp.replace(/\[align=[a-zA-Z]/ig, '');
  // temp = temp.replace(/\[color=#?[a-zA-Z0-9]+]/ig, ' ');
  // temp = temp.replace(/\[\/align]/ig, ' ');
  // temp = temp.replace(/\[\/color]/ig, ' ');
  // temp = temp.replace(/#{r=[0-9]+}/ig, ' <图> ');
  // temp = temp.replace(/\[url]/ig, '');
  // temp = temp.replace(/\[\/url]/ig, '');
  // temp = temp.replace(/\[em[0-9]+]/ig, '');
  return temp;
};

function toQueryString(object) {
  let qs = '';
  for (const key of Object.keys(object)) {
    const value = object[key];
    if (value !== undefined && value !== null) {
      if (qs === '') {
        qs += key.toString() + '=' + value.toString();
      } else {
        qs += '&' + key.toString() + '=' + value.toString();
      }
    }
  }
  return '?' + qs;
}

function htmlDiff(earlier, later) {
  return contentDiff(earlier, later);
}

function testModifyTimeLimit(time, ownership, toc) {
  // time === -1 时间无限制
  // ownership 自己或有'modifyOtherPost'操作权限
  if (!ownership) {
    return;
  }
  if (time === -1) {
    return true;
  }
  const timeLimit = time * 60 * 60 * 1000;
  const nowTime = Date.now();
  const postToc = toc.getTime();
  return nowTime - postToc < timeLimit;
}

let dateTimeString = (t) => {
  return moment(t).format('YYYY-MM-DD HH:mm');
};

function dateString(date) {
  var dateformat = 'YYYY-MM-DD HH:mm:ss';

  if (date) {
    //if input contains date
    return moment(date).format(dateformat);
  } else {
    return moment().format(dateformat);
  }
}
let creditString = (t) => {
  switch (t) {
    case 'xsf':
      return '学术分';
    case 'creditKcb':
      return '科创币';
    default:
      return '[未定义积分]';
  }
};

const fromNow = (time) => {
  return moment(time).fromNow();
};

const format = (type, toc) => {
  return moment(toc).format(type);
};

function timeFormat(time) {
  const type = 'YYYY/MM/DD HH:mm:ss';
  return format(type, time);
}

function highlightString(content, str) {
  let result = content;
  const keyWords = str.split(' ');
  for (const word of keyWords) {
    result = result.replace(word, `<span style="color: orange">${word}</span>`);
  }
  return result;
}

function filterQuote(content) {
  return content.replace(/\[quote.*\/quote]/gi, '');
}

// 去标签+略缩
function delCodeAddShrink(content) {
  content = content.replace(/<[^>]+>/g, '');
  if (content.length > 100) {
    var lastContent = content.substr(content.length - 50, content.length);
    content = content.substr(0, 50) + '~~~~~~~~~~~~' + lastContent;
  }
  return content;
}

// 去除全部标签
function delAllCode(content) {
  content = content.replace(/<[^>]+>/g, '');
  return content;
}

// 根据学术分隐藏内容
function hideContentByUser(content, user = { xsf: 0 }, from) {
  // console.log(content.match(/\[hide=([0-9]{1,3})](.+?)\[\/hide]/igm))
  // content = content.replace(/\n/igm,'');
  // content = content.replace(/\r/igm,'');
  if (content === null) {
    return '';
  }
  var c1 = content.replace(
    /\[hide=([0-9]{1,3}).*]([\s\S]*)\[\/hide]/gim,
    function (c, number, content) {
      number = parseInt(number);
      if (user.xsf >= number) {
        if (from === 'thread') {
          return c;
        } else {
          return content;
        }
      } else {
        if (from === 'thread') {
          return `[hide=${number}]内容已隐藏[/hide]`;
        } else {
          return '';
        }
      }
    },
  );
  return c1.replace(
    /<div class="nkcHiddenBox"><div class="nkcHiddenNotes" contenteditable="false">浏览这段内容需要(.+?)学术分<\/div><div class="nkcHiddenContent">(.+?)<\/div><\/div>/gim,
    function (c, number, content) {
      number = parseInt(number);
      if (user.xsf >= number) {
        if (from === 'thread') {
          return c;
        } else {
          return content;
        }
      } else {
        if (from === 'thread') {
          return `<div class="nkcHiddenBox"><div class="nkcHiddenNotes" contenteditable="false">浏览这段内容需要${number}学术分</div><div class="nkcHiddenContent">内容已隐藏</div></div>`;
        } else {
          return '';
        }
      }
    },
  );
  // <div class="nkcHiddenBox"><div class="nkcHiddenNotes" contenteditable="false">浏览这段内容需要500学术分</div><div class="nkcHiddenContent">阿三大苏打萨达萨达</div></div>
}

function ensureFundOperatorPermission(type, user, fund) {
  if (!fund) {
    return false;
  }
  const { expert, censor, financialStaff, admin, commentator, voter } = fund;
  const fn = (obj, user) => {
    if (!user) {
      return false;
    }
    for (let cert of obj.certs) {
      if (user.certs.includes(cert)) {
        return true;
      }
    }
    return obj.appointed.includes(user.uid);
  };
  switch (type) {
    case 'expert':
      return fn(expert, user);
    case 'censor':
      return fn(censor, user);
    case 'financialStaff':
      return fn(financialStaff, user);
    case 'admin':
      return fn(admin, user);
    case 'commentator':
      return fn(commentator, user);
    case 'voter':
      return fn(voter, user);
    default:
      throw '未知的身份类型。';
  }
}

function getProvinceCity(str) {
  var addressArr = str.split('/');
  var province;
  var city;
  var address;
  if (addressArr[0]) {
    province = addressArr[0];
  }
  if (addressArr[1]) {
    city = addressArr[1];
    var cityIndex = city.indexOf('&');
    if (cityIndex > -1) {
      city = city.substr(0, cityIndex);
    }
  }
  address = province + '/' + city;
  return address;
}

function numToFloatTwo(str) {
  str = (str / 100).toFixed(2);
  return str;
}

function calculateFreightPrice(freightPriceObj, count, isFreePost) {
  const { firstFreightPrice, addFreightPrice } = freightPriceObj;
  let freightPrice = 0;
  count = Number(count);
  if (!isFreePost) {
    if (isNaN(count) || count <= 0) {
      freightPrice = firstFreightPrice;
    } else {
      freightPrice = firstFreightPrice + addFreightPrice * (count - 1);
    }
  }
  return freightPrice;
}
// 组装ip查询链接
function ipUrl(ip) {
  return `http://www.ip138.com/ips138.asp?ip=${ip}&action=2`;
}
// pug渲染时藏数据，对应前端函数strToObj
function objToStr(obj) {
  return encodeURIComponent(JSON.stringify(obj));
}

/**
 * 省略字数，超过则用省略号
 * @param num 字数
 * @param str 字符串
 */
function cutContent(str, num) {
  if (!num) {
    num = 20;
  }
  let strNum = str.length;
  if (strNum < num) {
    return str;
  } else {
    str = str.substr(0, num);
    str += '......';
    return str;
  }
}

/**
 * 换行转换
 */
function LineFeedConversion(str) {
  str = str.replace(new RegExp('\\n', 'gm'), '<br/>');
  str = str.replace(new RegExp('\\s', 'gm'), '&nbsp;');
  return str;
}

/**
 * 获取声明等级
 */
function getOriginLevel(index) {
  let obj = {
    0: '不声明',
    1: '普通转载',
    2: '获授权转载',
    3: '受权发表(包括投稿)',
    4: '发表人参与原创(翻译)',
    5: '发表人是合作者之一',
    6: '发表人本人原创',
  };
  if (!index) {
    return obj;
  } else {
    for (var i in obj) {
      if (i == index) {
        return obj[i];
      }
    }
  }
}

let pugRender = (template, data, state, remoteState) => {
  data.userOperationsId = data.userOperationsId || [];
  const language =
    state && state.language ? state.language : languages['zh_cn'];
  let options = {
    markdown_safe: render.commonmark_safe,
    markdown: render.commonmark_render,
    dateTimeString: dateTimeString,
    fromNow: fromNow,
    format: format,
    timeFormat,
    LineFeedConversion: LineFeedConversion,
    getOriginLevel: getOriginLevel,
    server: settings.server,
    plain: render.plain_render,
    hexToRgba,
    experimental_render: render.experimental_render,
    nkcRender,
    replaceContent: replaceContent,
    highlightString,
    toQueryString,
    testModifyTimeLimit,
    dateString,
    creditString,
    htmlFilter,
    htmlDiff,
    filterQuote,
    hideContentByUser,
    delCodeAddShrink,
    ensureFundOperatorPermission,
    startTime: startTime,
    NODE_ENV: NODE_ENV,
    getProvinceCity: getProvinceCity,
    numToFloatTwo: numToFloatTwo,
    calculateFreightPrice: calculateFreightPrice,
    delAllCode: delAllCode,
    cutContent: cutContent,
    // 翻译 type: 语言分类, words：关键字
    lang: (type, words) => {
      return language[type][words];
    },
    // 验证用户是否具有执行该操作的权限
    permission: (operationId) => {
      return data.userOperationsId.includes(operationId);
    },
    permissionsOr: (operationsId) => {
      for (const id of operationsId) {
        if (data.userOperationsId.includes(id)) {
          return true;
        }
      }
      return false;
    },
    permissionsAnd: (operationsId) => {
      for (const id of operationsId) {
        if (!data.userOperationsId.includes(id)) {
          return false;
        }
      }
      return true;
    },
    state,
    remoteState,
    _moduleState: {},
    isIncluded: (name) => {
      if (options._moduleState[name]) {
        return true;
      }
      options._moduleState[name] = true;
      return false;
    },
    ipUrl,
    objToStr,
    anonymousInfo: {
      username: '匿名用户',
      avatar: '/default/default_anonymous_user_avatar.jpg',
    },
    basedir: process.cwd() + '/pages',
    tools,
    // 将数据对象转义为base64字符串
    // 解码在前端的lib/dataConversion.js base64ToObj
    objToBase64: (data = {}) => {
      const dataString = JSON.stringify(data);
      return Buffer.from(dataString || '').toString('base64');
    },
  };
  options.data = data;
  options.filters = filters;
  options.pretty = true; // 保留换行
  if (isProduction) {
    options.cache = true;
  } else {
    // options.debug = true;
  }
  return pug.renderFile(template, options);
};
module.exports = pugRender;
