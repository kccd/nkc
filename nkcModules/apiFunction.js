const settings = require('../settings');
let {perpage} = settings.paging;
let fn = {};

fn.paging = (page, arrLength) => {
  if(page === undefined) page = 0;
  return {
    page: parseInt(page),
    perpage: perpage,
    start: page*perpage,
    count: 65,
    pageCount: Math.ceil(arrLength/perpage),
	  aggregate: arrLength
  }
};

fn.getQueryObj = (query, match) => {
  const {digest, cat, sortby, page = 0} = query;
  const $match = Object.assign({}, match);
  if(cat)
    $match.cid = cat;
  if(digest)
    $match.digest = true;
  const $sort = {};
  if(sortby)
    $sort.toc = -1;
  else
    $sort.tlm = -1;
  let $skip, $limit;
  $skip = page * perpage;
  $limit = perpage;
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
  let path = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
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

module.exports = fn;