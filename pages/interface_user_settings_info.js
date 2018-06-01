function submit(id) {
	var obj = {
		description: $('#description').val(),
		postSign: $('#postSign').val(),
		color: $('#color').val()
	};

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

function saveNewUsername(id) {
	var username = $('#username').val();
	nkcAPI('/u/'+id+'/settings/username', 'PATCH', {newUsername: username})
		.then(function() {
			screenTopAlert('修改成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}