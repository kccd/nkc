var email={
	'qq.com': 'http://mail.qq.com',
	'gmail.com': 'http://mail.google.com',
	'sina.com': 'http://mail.sina.com.cn',
	'163.com': 'http://mail.163.com',
	'126.com': 'http://mail.126.com',
	'yeah.net': 'http://www.yeah.net/',
	'sohu.com': 'http://mail.sohu.com/',
	'tom.com': 'http://mail.tom.com/',
	'sogou.com': 'http://mail.sogou.com/',
	'139.com': 'http://mail.10086.cn/',
	'hotmail.com': 'http://www.hotmail.com',
	'live.com': 'http://login.live.com/',
	'live.cn': 'http://login.live.cn/',
	'live.com.cn': 'http://login.live.com.cn',
	'189.com': 'http://webmail16.189.cn/webmail/',
	'yahoo.com.cn': 'http://mail.cn.yahoo.com/',
	'yahoo.cn': 'http://mail.cn.yahoo.com/',
	'eyou.com': 'http://www.eyou.com/',
	'21cn.com': 'http://mail.21cn.com/',
	'188.com': 'http://www.188.com/',
	'foxmail.com': 'http://www.foxmail.com'
};

function sendBindEmail(uid) {
	var emailInfo = $('#emailInfo');
	emailInfo.html('');
	var obj = {
		email: $('#email').val(),
		operation: 'bindEmail'
	};
	if(obj.email === '') {
		return screenTopWarning('请输入邮箱地址');
	}
	nkcAPI('/u/'+uid+'/settings/email', 'POST', obj)
		.then(function() {
			var url = obj.email.split('@')[1];
			var href = email[url] || '###';
			var spanHTML = $('<span>邮件已发送至：</span>');
			var aHTML = $('<a href="'+href+'" target="_blank">'+obj.email+'</a>');
			emailInfo.append(spanHTML);
			emailInfo.append(aHTML);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function verifyOldEmail(uid, oldEmail) {
	var emailInfo = $('#emailInfo');
	var obj = {
		operation: 'verifyOldEmail'
	};
	nkcAPI('/u/'+uid+'/settings/email', 'POST', obj)
		.then(function() {
			$('#changeBtn').text('重新发送邮件');
			var url = oldEmail.split('@')[1];
			var href = email[url] || '###';
			var spanHTML = $('<span>邮件已发送至：</span>');
			var aHTML = $('<a href="'+href+'" target="_blank">'+oldEmail+'</a>');
			emailInfo.append(spanHTML);
			emailInfo.append(aHTML);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function sendNewEmail(uid) {
	var emailInfo = $('#emailInfo');
	var obj = {
		oldToken: $('#oldToken').val(),
		email: $('#email').val(),
		operation: 'verifyNewEmail'
	};
	if(obj.email === '') {
		return screenTopWarning('请输入新邮箱地址');
	}
	nkcAPI('/u/'+uid+'/settings/email', 'POST', obj)
		.then(function() {
			var url = obj.email.split('@')[1];
			var href = email[url] || '###';
			var spanHTML = $('<span>邮件已发送至：</span>');
			var aHTML = $('<a href="'+href+'" target="_blank">'+obj.email+'</a>');
			emailInfo.append(spanHTML);
			emailInfo.append(aHTML);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}