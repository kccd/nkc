const paging = require('../settings/paging');
const moment = require('moment');
const http = require("http");
const randomatic = require('randomatic');
moment.locale('zh-cn');
const defaultPerpage = paging.perpage;
let fn = {};
fn.paging = (page = 0, count, perpage, buttonCount = 5) => {
  if(!perpage) perpage = defaultPerpage;
  page = parseInt(page);
  const pageCount = Math.ceil(count/perpage);
  /*if(page >= pageCount) {
    if(pageCount > 0) page = pageCount - 1;
    else page = 0;
  }*/
  const buttonValue = fn.getPagingButton(page, pageCount, buttonCount);

  return {
    page,
    perpage,
    start: page*perpage,
    count: perpage,
    pageCount,
	  aggregate: count,
    buttonValue
  }
};

fn.getQueryObj = (query, match) => {
  const {digest, cat, sortby, page = 0} = query;
  const $match = Object.assign({}, match);
  if(cat)
    // $match.cid = cat;
  if(digest)
    $match.digest = true;
  const $sort = {};
  if(sortby)
    $sort.toc = -1;
  else
    $sort.tlm = -1;
  let $skip, $limit;
  $skip = page * defaultPerpage;
  $limit = defaultPerpage;
  return {
    $match,
    $sort,
    $skip,
    $limit
  }
};

fn.sha256HMAC = (password,salt) => {
  const crypto = require('crypto');
  let hmac = crypto.createHmac('sha256',salt);
  hmac.update(password);
  return hmac.digest('hex')
};
fn.MD5 = (password, salt) => {
	const crypto = require('crypto');
	const md5 = (str) => {
		const md5 = crypto.createHash('md5');
		md5.update(str);
		return md5.digest('hex');
	};
	return md5(md5(password)+salt);
};
fn.testPassword = (input,hashType,storedPassword) => {
  let pass = '';
  let hash = '';
  let salt = '';
  let hashed = '';
  switch (hashType) {
    case 'pw9':
      pass = input;
      hash = storedPassword.hash;
      salt = storedPassword.salt;

      hashed = fn.MD5(pass, salt);
      if(hashed!==hash){
        return false;
      }
      break;

    case 'sha256HMAC':
      pass = input;
      hash = storedPassword.hash;
      salt = storedPassword.salt;

      hashed = fn.sha256HMAC(pass,salt);
      if(hashed!==hash){
        return false;
      }
      break;

    default:
      if(input !== storedPassword){ //fallback to plain
        return false;
      }
  }
  return true;
};
fn.newPasswordObject = (plain) => {
  let salt = Math.floor((Math.random()*65536)).toString(16);
  let hash = fn.sha256HMAC(plain,salt);
  return {
    hashType:'sha256HMAC',
    password:{
      hash:hash,
      salt:salt,
    }
  };
};
fn.contentLength =  (content) => {
  const zhCN = content.match(/[^\x00-\xff]/g);
  const other = content.match(/[\x00-\xff]/g);
  const length1 = zhCN? zhCN.length * 2 : 0;
  const length2 = other? other.length : 0;
  return length1 + length2
};

fn.random = (n) => {
  let Num = "";
  for(let i = 0; i < n; i++) {
    Num += Math.floor(Math.random()*10);
  }
  return Num;
};

fn.getEmailToken = () => {
	return Math.floor((Math.random()*(65536*65536))).toString(16);
};

// 检查邮箱格式
fn.checkEmailFormat = (email) => {
  let path = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  return path.test(email);
};

fn.checkPass = (s) => {
  let ls = 0;
  if(s.match(/([a-zA-Z])+/)){
    ls++;
  }
  if(s.match(/([0-9])+/)){
    ls++;
  }
  if(s.match(/[^a-zA-Z0-9]+/)){
    ls++;
  }
  return (ls >= 2);
};

fn.encodeRFC5987ValueChars = (str) => {
  return encodeURIComponent(str).
  // 注意，仅管 RFC3986 保留 "!"，但 RFC5987 并没有
  // 所以我们并不需要过滤它
  replace(/['()]/g, escape). // i.e., %27 %28 %29
  replace(/\*/g, '%2A').
  // 下面的并不是 RFC5987 中 URI 编码必须的
  // 所以对于 |`^ 这3个字符我们可以稍稍提高一点可读性
  replace(/%(?:7C|60|5E)/g, unescape);
};

/*
* 过去指定范围内的整数
* */
fn.getRandomNumber = (obj) => {
	const {count, min, max, repeat} = obj;
	if(!repeat && (max-min+1) < count) {
		const error = new Error(`范围[${min}, ${max}]不可能生成${count}个不同的数字。`);
		error.status = 500;
		throw error;
	}
	const arr = [];
	while(arr.length < count) {
		const number = Math.round(Math.random()*(max-min) + min);
		if(repeat) {
			arr.push(number);
		} else {
			if(!arr.includes(number)) {
				arr.push(number);
			}
		}
	}
	return arr;
};

fn.today = (time) => {
	const moment = require('moment');
	let t;
	if(time) {
		t = moment(time).format('YYYY-MM-DD');
	} else {
		t = moment().format('YYYY-MM-DD');
	}
	return new Date(t+' 00:00:00');
};

fn.dayCountOfOneMonth = (year, month) => {
	let nextMonth, nextYear;
	if(month === 12) {
		nextMonth = 1;
		nextYear = year + 1;
	} else {
		nextMonth = month + 1;
		nextYear = year;
	}
	const nextMonthTime = new Date(`${nextYear}-${nextMonth}-1 00:00:00`);
	const lastDay = nextMonthTime.getTime() - 24*60*60*1000;
	return new Date(lastDay).getDate();
};
fn.dayCountOfOneYear = (year) => {
	const a = year%4;
	const b = year%100;
	const c = year%400;
	if((a === 0 && b !== 0) || c === 0) return 366;
	return 365;
};

fn.fromNow = (time) => {
	return moment(time).fromNow();
};


// 获取纯文本,以及略缩文字
// content[str] 原文本 
// reduce[bull] 是否进行略缩，默认为false
// count[int]   略缩后剩下的字数
fn.obtainPureText = (content, reduce, count) => {
  if(!content) return content;
  // 过滤HTML空格
  content = content.replace(/&nbsp;/ig,"");
  // 过滤HTML引用
  content = content.replace(/<blockquote.*?blockquote>/g,"");
  // 过滤bbcode隐藏
  content = content.replace(/\[hide=.*?][\s\S]*?\[\/hide]/ig, "");
  // 过滤bbcode引用
  content = content.replace(/\[quote.*?][\s\S]*?\[\/quote]/ig, "");
  content = content.replace(/<[^>]+>/g,"");
  content = content.replace(/#{r=[0-9]+?}/g,"[资源]");
  count = parseInt(count);
  if(reduce === true){
    if(content.length > count){
      content = content.substr(0,count) + "...";
    }
  }
  return content;
};

// 将全部板块转为app可用json
fn.forumsToJson = (fors) => {
  let newArr = [];
  let obj = {};
  for(let i in fors){
    if(fors[i].childrenForums && fors[i].childrenForums.length > 0){
      let subs = fn.forumsToJson(fors[i].childrenForums)
      obj = {
        name: fors[i].displayName,
        fid: fors[i].fid,
        sub: subs
      }
      newArr.push(obj)
    }else{
      obj = {
        name: fors[i].displayName,
        fid: fors[i].fid
      }
      newArr.push(obj)
    }
  }
  return newArr;
}

// 学科转为JSON
fn.disciplineToJSON = (fors) => {
  let newArr = [];
  let obj = {};
  for(let i in fors){
    if(fors[i].forumType == "discipline"){
      if(fors[i].childrenForums && fors[i].childrenForums.length > 0){
        let subs = fn.disciplineToJSON(fors[i].childrenForums)
        obj = {
          name: fors[i].displayName,
          fid: fors[i].fid,
          sub: subs
        }
        newArr.push(obj)
      }else{
        obj = {
          name: fors[i].displayName,
          fid: fors[i].fid
        }
        newArr.push(obj)
      }
    }
  }
  return newArr;
}

// 话题转为JSON
fn.topicToJSON = (fors) => {
  let newArr = [];
  let obj = {};
  for(let i in fors){
    if(fors[i].forumType == "topic"){
      if(fors[i].childrenForums && fors[i].childrenForums.length > 0){
        let subs = fn.topicToJSON(fors[i].childrenForums)
        obj = {
          name: fors[i].displayName,
          fid: fors[i].fid,
          sub: subs
        }
        newArr.push(obj)
      }else{
        obj = {
          name: fors[i].displayName,
          fid: fors[i].fid
        }
        newArr.push(obj)
      }
    }
  }
  return newArr;
}

// 生成数字与小写字母组成的随机码
fn.makeRandomCode = (digit) => {
  var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  var ranstr = "";
  digit = parseInt(digit);
  for(var i=0;i<digit;i++){
    var pos = Math.round(Math.random() * (arr.length-1));
    ranstr += arr[pos]
  }
  return ranstr;
}
/* 
  随机交换数组元素的位置
  @param arr: 需要交换元素顺序的数组
  @author pengxiguaa 2019/2/19
*/
fn.shuffle = (arr) => {
  const length = arr.length;
  for(let i = 0; i < length; i++) {
    const index = Math.round(Math.random()*(length-1));
    const n = arr[i];
    arr[i] = arr[index];
    arr[index] = n;      
  }
}
/* 
  从多个数组中取值，组成与原数组长度相同的不重复的新数组
  @param arr 原数组：
  [
    ['a', 'b', 'c'],
    [1, 2, 3],
    ['A', 'B', 'C'],
    ...
  ]
  @return 新数组：
  [
    ['a', 1, 'A'],
    ['a', 1, 'B'],
    ['a', 1, 'C'],
    ['a', 2, 'A'],
    ['a', 2, 'B'],
    ['a', 2, 'C'],
    ...
  ]
  @author https://www.cnblogs.com/liugang-vip/p/5985210.html
*/
fn.doExchange = (arr) => {
  const len = arr.length;
  // 当数组大于等于2个的时候
  if(len >= 2){
    // 第一个数组的长度
    const len1 = arr[0].length;
    // 第二个数组的长度
    const len2 = arr[1].length;
    // 2个数组产生的组合数
    const lenBoth = len1 * len2;
    //  申明一个新数组
    const items = new Array(lenBoth);
    // 申明新数组的索引
    let index = 0;
    for(let i = 0; i < len1; i++) {
      for(let j = 0; j < len2; j++) {
        if(arr[0][i] instanceof Array){
          items[index] = arr[0][i].concat(arr[1][j]);
        } else {
          items[index] = [arr[0][i]].concat(arr[1][j]);
        }
        index++;
      }
    }
    const newArr = new Array(len -1);
    for(let i = 2; i < arr.length; i++) {
      newArr[i-1] = arr[i];
    }
    newArr[0] = items;
    return fn.doExchange(newArr);
  }else if(len === 1) {
    return arr[0];
  } else {
    return arr;
  }
}


/**
 * 查询ip所在地地理位置(阿里云)
 * @param {String} ip ip地址
 * @return {JSON} data
 * @author Kris 2019-3-14
 */
fn.getIpAddress = async (ip) => {
  const aliAppCode = require("../config/aliAppCode");
  const {appCode} = aliAppCode;
  let options = {
    hostname: `iploc.market.alicloudapi.com`,    //接口域
    path: `/v3/ip?ip=${ip}`,    //请求地址
    headers: {    //请求头
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "APPCODE "+appCode
    }
  }
  return new Promise((resolve, reject) => {
      // 发起请求
      let req = http.request(options, res => {
          let chunks = [];
          res.on('data', chunk => {
              chunks.push(chunk);
          })
          res.on('end', () => {
              let buffer = Buffer.concat(chunks).toString();
              // 如果接口返回空值
              let data = buffer ? JSON.parse(buffer) : {code: 1, data: 'ip接口没有返回值'};
              resolve(data);
          })
      })
      // 请求出错
      req.on('error', err => {
          resolve({code: 1, data: "请求ip接口出错"});
      })
      // 请求结束
      req.end();
  })
}

fn.getTrackInfo = async (trackNumber, trackName) => {
  const db = require('../dataModels');
  let objInfo;
  let cacheData = await db.ApiCacheDataModel.findOne({id:trackNumber});
  if(!cacheData) {
    objInfo = await fn.getTrackInfoData(trackNumber, trackName);
    cacheData = db.ApiCacheDataModel({
      id: trackNumber,
      c: JSON.stringify(objInfo),
      type: 'track'
    });
    await cacheData.save();
  }else{
    let nowToc = Date.now()-2*60*60*1000;
    if(nowToc > Number(cacheData.toc)){
      let newObjInfo = await fn.getTrackInfoData(trackNumber, trackName);
      await cacheData.update({toc:Date.now(), c:JSON.stringify(newObjInfo)})
    }
    objInfo = JSON.parse(cacheData.c)
  }
  return objInfo;
}


/**
 * 查询物流信息(阿里云)
 * @param {String} trackNumber 快递单号 
 * @param {String} trackName 快递公司简称
 * @return {JSON} data:由接口返回的物流信息，JSON
 * @author Kris 2019-3-18
 */
fn.getTrackInfoData = (trackNumber, trackName) => {
  const aliAppCode = require("../config/aliAppCode");
  const {appCode} = aliAppCode;
  let options = {
    hostname: `wuliu.market.alicloudapi.com`,    //接口域
    headers: {    //请求头
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "APPCODE "+appCode
    }
  };
  if(!trackName || trackName == "AUTO") {
    options.path = `/kdi?no=${trackNumber}`
  }else{
    options.path = `/kdi?no=${trackNumber}&type=${trackName}`
  }
  return new Promise((resolve, reject) => {
      // 发起请求
      let req = http.request(options, res => {
          let chunks = [];
          res.on('data', chunk => {
              chunks.push(chunk);
          })
          res.on('end', () => {
              let buffer = Buffer.concat(chunks).toString();
              // 如果接口返回空值
              let data = {};
              if(buffer) {
                try{
                  data = JSON.parse(buffer)
                }catch(err) {

                }
              }else{
                data = {code: 1, data: '物流信息接口没有返回值'}
              }
              // let data = buffer ? JSON.parse(buffer) : {code: 1, data: '物流信息接口没有返回值'};
              resolve(data);
          })
      })
      // 请求出错
      req.on('error', err => {
          resolve({code: 1, data: "请求物流信息接口出错"});
      })
      // 请求结束
      req.end();
  })
}

/**
 * 计算运费
 * @param {Object} freightPriceObj 运费对象
 * @param {Number} count 商品数量
 * @param {Boolean} isFreePost 是否包邮
 * @return {Number} freight:最终运费价格
 * @author Kris 2019-4-9
 */
fn.calculateFreightPrice = (freightPriceObj, count, isFreePost) => {
  const {firstFreightPrice, addFreightPrice} = freightPriceObj;
  let freightPrice = 0;
	count = Number(count);
	if(!isFreePost) {
		if(isNaN(count) || count <=0) {
			freightPrice = firstFreightPrice;
		}else{
			freightPrice = firstFreightPrice + (addFreightPrice*(count - 1));
		}
	}
  return freightPrice;
}

/**
 * 生成新的app跳转的url
 * @param {*} state 这里必须传入ctx.state
 * @param {*} url 
 */
fn.generateAppLink = (state, url) => {
  /*state.cachePage = false;
	if(state.isApp) {
		let paramIndex = url.indexOf("?");
		if(paramIndex > -1) {
			url += "&apptype=app"
		}else{
			url += "?apptype=app";
		}
	}*/
	return url;
}

/*
* 获取分页按钮的数值
* @param {Number} page 当前所在分页数
* @param {Number} pageCount 总的分页数
* @return {[Number]} 分页按钮数值，空元素表示省略
* @author pengxiguaa 2019-6-12
* */
fn.getPagingButton_ = (paging) => {
  const {page = 0, pageCount = 1} = paging;
  const arr = [];
  // 总页数不超过1 无需分页
  if(pageCount <= 1) return arr;

  let reduce1 = page - 3;
  let reduce2 =  page + 3;

  let max, min;

  if(reduce1 > 0) {
    if(reduce2 > pageCount) {
      max = pageCount;
      if(reduce1 - (reduce2 - pageCount) < 0) {
        min = 0;
      } else {
        min = reduce1 - (reduce2 - pageCount);
      }
    } else {
      max = reduce2;
      min = reduce1;
    }
  } else {
    min = 0;
    if(reduce2 <pageCount) {
      if(pageCount < (reduce2 - reduce1)) {
        max = pageCount;
      } else {
        max = reduce2 - reduce1;
      }
    } else {
      max = pageCount - 1;
    }
  }

  if(min !== 0) {
    arr.push({
      type: "common",
      num: 0
    });
    if(min > 1) {
      arr.push({
        type: "null"
      });
    }
  }
  for(let i = 0; i < pageCount; i++) {
    if(i >= min && i <= max) {
      let type = "common";
      if(page === i) {
        type = "active";
      }
      arr.push({
        type,
        num: i
      });
    }
  }
  if(max < (pageCount - 1)) {
    if(max < (pageCount -2)) {
      arr.push({
        type: "null"
      });
    }
    arr.push({
      type: "common",
      num: pageCount - 1
    })
  }
  return arr;
};

/*
* 分页按钮计算
* @param {Number} page 当前所在页
* @param {Number} pageCount 总页数
* @param {Number} 显示的按钮个数，仅支持奇数
* @author pengxiguaa 2019-9-26
* */
fn.getPagingButton = (page = 0, pageCount = 0, buttonCount = 5) => {
  const arr = [];
  if(pageCount <= 1) return arr;
  const leftCount = (buttonCount - 1) / 2;
  // 计算左侧按钮
  for(let i = page - leftCount; i < page; i++) {
    if(i < 0) continue;
    arr.push({
      type: "common",
      num: i
    });
  }
  // 当前页按钮
  arr.push({
    type: "active",
    num: page
  });
  // 计算右侧按钮
  for(let i = page + 1; i < pageCount; i++) {
    if(arr.length >= buttonCount) break;
    arr.push({
      type: "common",
      num: i
    });
  }
  // 添加首尾
  const firstPage = arr[0];
  const lastPage = arr[arr.length - 1];
  if(firstPage.num > 0) {
    if(firstPage.num > 1) {
      arr.unshift({
        type: "null"
      });
    }
    arr.unshift({
      type: "common",
      num: 0
    });
  }
  if(lastPage.num < (pageCount - 1)) {
    if(lastPage.num < (pageCount - 2)) {
      arr.push({
        type: "null"
      });
    }
    arr.push({
      type: "common",
      num: pageCount - 1
    });
  }
  return arr;
};

/*
* 获取随机字符串
* @param {String} pattern
      a: Lowercase alpha characters (abcdefghijklmnopqrstuvwxyz')
      A: Uppercase alpha characters (ABCDEFGHIJKLMNOPQRSTUVWXYZ')
      0: Numeric characters (0123456789')
      !: Special characters (~!@#$%^&()_+-={}[];\',.)
      *: All characters (all of the above combined)
      ?: Custom characters (pass a string of custom characters to the options)
* @param {Number} length 字符串长度
* @return {String}
* @author pengxiguaa 2019-8-14
* */
fn.getRandomString = (pattern, length) => {
  return randomatic(pattern, length);
};

/*
* 获取管理相关的未处理条数 临时
* */
fn.extendManagementInfo = async (ctx) => {
  // 管理操作
  const {data, db} = ctx;
  if(ctx.permission("complaintGet")) {
    data.unResolvedComplaintCount = await db.ComplaintModel.count({resolved: false});
  }
  if(ctx.permission("visitProblemList")) {
    data.unResolvedProblemCount = await db.ProblemModel.count({resolved: false});
  }
  if(ctx.permission("review")) {
    const q = {
      reviewed: false,
      disabled: false,
      mainForumsId: {$ne: "recycle"}
    };
    if(!ctx.permission("superModerator")) {
      const forums = await db.ForumModel.find({moderators: data.user.uid}, {fid: 1});
      const fid = forums.map(f => f.fid);
      q.mainForumsId = {
        $in: fid
      }
    }
    const posts = await db.PostModel.find(q, {tid: 1, pid: 1});
    const threads = await db.ThreadModel.find({tid: {$in: posts.map(post => post.tid)}}, {recycleMark: 1, oc: 1, tid: 1});
    const threadsObj = {};
    threads.map(thread => threadsObj[thread.tid] = thread);
    let count = 0;
    posts.map(post => {
      const thread = threadsObj[post.tid];
      if(thread && (thread.oc !== post.pid || !thread.recycleMark)) {
        count++;
      }
    });
    data.unReviewedCount = count;
  }
};

module.exports = fn;