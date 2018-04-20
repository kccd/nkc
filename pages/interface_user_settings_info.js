function submit(id, username) {
	var obj = {
		username: $('#username').val(),
		description: $('#description').val(),
		postSign: $('#postSign').val(),
		color: $('#color').val()
	};
	if(obj.username === '') {
		return screenTopWarning('请输入用户名');
	}
	if(username !== obj.username) {
		if(confirm('您将花费200个科创币将同户名改为“'+obj.username+'”，确认无误后请点击确认按钮。') === false) return;
	}
	nkcAPI('/u/'+id+'/settings/info', 'PATCH', obj)
		.then(function() {
			screenTopAlert('修改成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}