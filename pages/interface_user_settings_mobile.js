var nationCode = '86';
//选择国际区号
function chooseCountryNum(num){
	nationCode = parseInt(num);
}

function changeNumber() {
	$('#btnChangeNumber').hide();
	$('#inputDiv').show();
}

function sendMessage(type) {
	var obj = {operation: 'ensureOldMobile'};

	if(type) {
		obj.operation = 'ensureNewMobile';
		obj.nationCode = nationCode;
		obj.mobile = $('#mobile').val();
		if(mobile === '') {
			return screenTopWarning('请输入新手机号');
		}
	}

	nkcAPI('/sendMessage/changeMobile', 'POST', obj)
		.then(function() {
			screenTopAlert('验证码发送成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})


}

function submitChangeMobile(uid) {
	var obj = {
		oldCode: $('#oldCode').val(),
		code: $('#code').val(),
		mobile: $('#mobile').val(),
		nationCode: nationCode
	};
	if(obj.oldCode === '') {
		return screenTopWarning('请输入旧手机验证码');
	}
	if(obj.code === '') {
		return screenTopWarning('请输入新手机验证码');
	}
	if(obj.mobile === '') {
		return screenTopWarning('请输入新手机号码');
	}
	nkcAPI('/u/'+uid+'/settings/mobile', 'PATCH', obj)
		.then(function() {
			screenTopAlert('绑定成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function submitBindMobile(uid) {
	var obj = {
		code: $('#code').val(),
		mobile: $('#mobile').val(),
		nationCode: nationCode
	};
	if(obj.code === '') {
		return screenTopWarning('请输入手机验证码');
	}
	if(obj.mobile === '') {
		return screenTopWarning('请输入手机号码');
	}
	nkcAPI('/u/'+uid+'/settings/mobile', 'POST', obj)
		.then(function() {
			screenTopAlert('绑定成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function bindMobileMessage() {
	var obj = {
		mobile: $('#mobile').val(),
		nationCode: nationCode
	};
	if(obj.mobile === '') {
		return screenTopWarning('请输入手机号码');
	}
	nkcAPI('/sendMessage/bindMobile', 'POST', obj)
		.then(function() {
			screenTopAlert('验证码发送成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}