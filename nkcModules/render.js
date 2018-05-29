const render = require('./nkc_render');
const moment = require('moment');
const pug = require('pug');
const jsdiff = require('diff');
const settings = require('../settings');
moment.locale('zh-cn');
let filters = {
  markdown:render.commonmark_render,
  markdown_safe:render.commonmark_safe,
  bbcode:render.bbcode_render,
  thru: function(k){return k},
};
let getCertsInText = (user) => {
  let perm = require('./permissions.js');

  let certs =  perm.calculateThenConcatCerts(user);

  let s = '';
  for(i in certs){
    let cname = perm.getDisplayNameOfCert(certs[i]);
    s+=cname+' ';
  }
  return s;
};

const replaceContent = (c) => {
  let temp = c;
  temp = temp.replace(/<[a-zA-Z]+.*?>/ig, ' ');
  temp = temp.replace(/<\/[a-zA-Z]+>/ig, ' ');
  temp = temp.replace(/\[hide=[0-9]+][^[]*\[\/hide]/ig, '<span style="background-color: red">学术分限制内容</span>');
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
  for(const key of Object.keys(object)) {
    const value = object[key];
    if(value !== undefined && value !== null){
      if(qs === '') qs += key.toString() + '=' + value.toString();
      else qs += '&' + key.toString() + '=' + value.toString();
    }
  }
  return '?' + qs;
}

function htmlDiff(earlier,later){
  let diff = jsdiff.diffChars(earlier,later);
  let outputHTML = '';

  diff.forEach(function(part){
    let stylestr = part.added?'DiffAdded':part.removed?'DiffRemoved':null;
    part.value = render.plain_render(part.value);
    outputHTML += (stylestr?`<span class="${stylestr}">${part.value}</span>`:part.value)
  });
  return outputHTML
}

function testModifyTimeLimit(cs, ownership, toc){

  let smtl = cs.selfModifyTimeLimit;
  let emtl = cs.elseModifyTimeLimit;

  // if you can modify others in 1y,
  // you should be able to do that to yourself,
  // regardless of settings. // wtf r u talking about   wtf r u talking about!!!! --lzszone
  if(smtl<emtl){
    smtl = emtl
  }
  //who dat fuck wrote these fucking codes,
  //--test ownership--
  if(ownership)
    // if he own the post
    return Date.now() < toc.getTime() + smtl;
  return Date.now() < toc.getTime() + emtl
}

let dateTimeString = (t) => {
  return moment(t).format('YYYY-MM-DD HH:mm')
};

function dateString(date){
  var dateformat="YYYY-MM-DD HH:mm:ss";

  if(date)//if input contains date
  {
    return moment(date).format(dateformat);
  }
  else
  {
    return moment().format(dateformat);
  }
}
let creditString = (t) => {
  switch (t) {
    case 'xsf':
      return '学术分';
      break;
    case 'kcb':
      return '科创币';
      break;
    default:
      return '[未定义积分]'
  }
};

let fromNow = (time) => {
  return moment(time).fromNow();
};

function highlightString(content, str) {
  let result = content;
  const keyWords = str.split(' ');
  for(const word of keyWords) {
    result = result.replace(word, `<span style="color: orange">${word}</span>`)
  }
  return result
}

function filterQuote(content) {
  return content.replace(/\[quote.*\/quote]/ig, '')
}

// 去标签+略缩
function delCodeAddShrink(content){
	content = content.replace(/<[^>]+>/g,"");
	if(content.length > 100){
		var lastContent = content.substr(content.length-50,content.length)
		content = content.substr(0,50) + "~~~~~~~~~~~~" + lastContent;
	}
	return content
}

// 根据学术分隐藏内容
function hideContentByUser(content, user={xsf: 0}, from) {
	// console.log(content.match(/\[hide=([0-9]{1,3})](.+?)\[\/hide]/igm))
	// content = content.replace(/\n/igm,'');
	// content = content.replace(/\r/igm,'');
	var c1 = content.replace(/\[hide=([0-9]{1,3}).*]([\s\S]*)\[\/hide]/igm, function(c, number, content){
		number = parseInt(number);
		if(user.xsf >= number) {
			if(from === 'thread') {
				return c;
			} else {
				return content;
			}
		} else {
			if(from === 'thread') {
				return `[hide=${number}]内容已隐藏[/hide]`;
			} else {
				return '';
			}
		}
	});
	return c1.replace(/<div class="nkcHiddenBox"><div class="nkcHiddenNotes" contenteditable="false">浏览这段内容需要(.+?)学术分<\/div><div class="nkcHiddenContent">(.+?)<\/div><\/div>/igm, function(c, number, content){
		number = parseInt(number);
		if(user.xsf >= number) {
			if(from === 'thread') {
				return c;
			} else {
				return content;
			}
		} else {
			if(from === 'thread') {
				return `<div class="nkcHiddenBox"><div class="nkcHiddenNotes" contenteditable="false">浏览这段内容需要${number}学术分</div><div class="nkcHiddenContent">内容已隐藏</div></div>`;
			} else {
				return '';
			}
		}
	});
  	// <div class="nkcHiddenBox"><div class="nkcHiddenNotes" contenteditable="false">浏览这段内容需要500学术分</div><div class="nkcHiddenContent">阿三大苏打萨达萨达</div></div>
}

function applicationFormStatus(a) {
	let str, color = '#888';
	const {submittedReport, status} = a;
	const {submitted, projectPassed, adminSupport, remittance, completed, excellent, successful, usersSupport} = status;
	let needRemittance = false;
	for(let r of a.remittance) {
		if(r.passed && !r.status) {
			needRemittance = true;
			break;
		}
	}
	if(a.disabled) {
		str = '已被屏蔽';
		color = 'red';
	} else if(a.useless === 'giveUp') {
		str = '已被申请人放弃';
		color = 'red';
	} else if(a.useless === 'delete') {
		str = '已被申请人删除';
		color = 'red';
	} else if(a.useless === 'exceededModifyCount') {
		str = '退修次数超过限制';
		color = 'red';
	} else if(a.useless === 'refuse') {
		str = '已被彻底拒绝';
		color = 'red';
	} else if(!submitted || !a.lock.submitted) {
		if(projectPassed === false) {
			str = '专家审核不通过，等待申请人修改';
			color = 'red';
		} else if(adminSupport === false) {
			str = '管理员复核不通过，等待申请人修改';
			color = 'red';
		} else {
			str = '暂未提交';
		}
	} else if(!usersSupport) {
		str = '等待网友支持';
	} else if(projectPassed === null) {
		str = '等待专家审核';
	} else if(projectPassed === false) {
		str = '专家审核不通过，等待申请人修改';
		color = 'red';
	} else if(adminSupport === null) {
		str = '等待管理员复核';
	} else if(adminSupport === false) {
		str = '管理员复核不通过，等待申请人修改';
		color = 'red';
	} else if(remittance === null) {
		str = '等待拨款';
	} else if(remittance === false) {
		str = '拨款出现问题，等待管理员处理';
		color = 'red';
	} else if(submittedReport) {
		str = '等待报告审核';
	} else if(needRemittance) {
		str = '等待拨款';
	} else if(completed === null) {
		str = '资助中';
	} else if(completed === false) {
		str = '结题审核不通过，等待申请人修改'
	} else if(excellent) {
		str = '优秀项目';
	} else if(successful) {
		str = '正常结题';
	} else if(!successful) {
		str = '失败结题';
	}
	return {str, color};
}

function ensureFundOperatorPermission(type, user, fund) {
	if(!fund) return false;
	const {expert, censor, financialStaff, admin, commentator, voter} = fund;
	const fn = (obj, user) => {
		if(!user) return false;
		for(let cert of obj.certs) {
			if(user.certs.includes(cert)) return true;
		}
		return obj.appointed.includes(user.uid);
	};
	switch (type) {
		case 'expert': return fn(expert, user);
		case 'censor': return fn(censor, user);
		case 'financialStaff': return fn(financialStaff, user);
		case 'admin': return fn(admin, user);
		case 'commentator': return fn(commentator, user);
		case 'voter': return fn(voter, user);
		default: throw '未知的身份类型。';
	}
}

let pugRender = (template, data) => {
  let options = {
    markdown_safe: render.commonmark_safe,
    markdown: render.commonmark_render,
    dateTimeString: dateTimeString,
    fromNow: fromNow,
    server: settings.server,
    plain:render.plain_render,
    experimental_render:render.experimental_render,
    replaceContent: replaceContent,
    highlightString,
    toQueryString,
    testModifyTimeLimit,
    dateString,
    creditString,
    htmlDiff,
    filterQuote,
		hideContentByUser,
		delCodeAddShrink,
	  applicationFormStatus,
	  ensureFundOperatorPermission,
  };
  options.data = data;
  options.filters = filters;
  options.pretty = true; // 保留换行
	if(['production', 'development'].includes(process.env.NODE_ENV)) {
		options.cache = true;
	}
  return pug.renderFile(template, options);
};
module.exports = pugRender;
