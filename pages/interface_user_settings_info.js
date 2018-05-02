function submit(id, username) {
	var obj = {
		username: $('#username').val(),
		description: $('#description').val(),
		postSign: $('#postSign').val(),
		color: $('#color').val()
	};
	if(!obj.username) {
		obj.username = username;
	}
	nkcAPI('/u/'+id+'/settings/info', 'PATCH', obj)
		.then(function() {
			screenTopAlert('修改成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function changeUsername() {
	$('#usernameInput').show();
}