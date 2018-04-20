function submit(uid) {
	var obj = {
		oldPassword: $('#oldPassword').val(),
		password: $('#password').val(),
		password2: $('#password2').val()
	};
	if(obj.oldPassword === '') {
		return screenTopWarning('请输入旧密码');
	}
	if(obj.password === '') {
		return screenTopWarning('请输入新密码');
	}
	if(obj.password !== obj.password2) {
		return screenTopWarning('两次输入的新密码不一致');
	}
	nkcAPI('/u/'+uid+'/settings/password', 'PATCH', obj)
		.then(function() {
			screenTopAlert('修改成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}