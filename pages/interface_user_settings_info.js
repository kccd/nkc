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
	var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
	var username = $('#username').val();
	if(pattern.test(username)){
		getFocus("#username")
		// throw('用户名含有非法字符')
		return screenTopWarning('用户名含有非法字符！')
	}
	return nkcAPI('/u/'+id+'/settings/username', 'PATCH', {newUsername: username})
		.then(function() {
			screenTopAlert('修改成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function getFocus(a){
  $(a).css('border-color','#f88')
  $(a).focus()
  $(a).blur(function(){
    $(a).css('border-color','')
  })
}